// ===== SCENARIO DATA =====
const scenarios = {
    tarif: {
        name: "Increase of Tariffs +25%",
        color: "#ff4444",
        chain: [
            { vt: "supply" },
            { vt: "product" },
            { vt: "production" }
        ]
    },
    labor: {
        name: "Labor Shortage Crisis",
        color: "#ff6b35",
        chain: [
            { vt: "production" },
            { vt: "product" },
            { vt: "supply" }
        ]
    },
    material: {
        name: "Material Change Required",
        color: "#9d4edd",
        chain: [
            { vt: "product" },
            { vt: "supply" },
            { vt: "production" }
        ]
    }
};

// ===== STATE MANAGEMENT =====
let currentScenario = null;
let currentStep = 0;
let canvas = null;
let ctx = null;
let drawnLines = []; // Store all drawn lines with their state
let clickCount = 0; // Track clicks on current VT (0=red, 1=green, 2=cascade)

// ===== SUPABASE REAL-TIME SYNC =====
let supabaseClient = null;
let realtimeChannel = null;
let isController = false; // Am I controlling the session?
let sessionId = null; // Current session ID

// ===== SDK INTEGRATION =====
// Function to send visibility messages to the SDK platform
function toggleVisibility(actorName, visible) {
    console.log("toggleVisibility:", actorName, visible);
    window.parent.postMessage(JSON.stringify({
        action: "toggleVisibility",
        actor: actorName,
        visible: visible
    }), "*");
}

// Function to show Issue and hide Working for a specific VT
function showIssue(vtType) {
    const issueActor = `Issue ${vtType.charAt(0).toUpperCase() + vtType.slice(1)}`;
    const workingActor = `Working ${vtType.charAt(0).toUpperCase() + vtType.slice(1)}`;

    toggleVisibility(issueActor, true);   // Show Issue
    toggleVisibility(workingActor, false); // Hide Working

    console.log(`Problem detected on ${vtType}: showing ${issueActor}, hiding ${workingActor}`);
}

// Function to hide Issue and show Working for a specific VT
function resolveIssue(vtType) {
    const issueActor = `Issue ${vtType.charAt(0).toUpperCase() + vtType.slice(1)}`;
    const workingActor = `Working ${vtType.charAt(0).toUpperCase() + vtType.slice(1)}`;

    toggleVisibility(issueActor, false);  // Hide Issue
    toggleVisibility(workingActor, true); // Show Working

    console.log(`Problem resolved on ${vtType}: hiding ${issueActor}, showing ${workingActor}`);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    initStars();
    initCanvas();
    await initSupabase();
    initEventListeners();

    console.log("SDK Functions loaded - ready to toggle VT visibility");
    console.log("Supabase Real-time sync enabled - User ID:", window.USER_ID);
    console.log("MANUAL MODE - Click-based progression");
});

// ===== STARS CREATION =====
function initStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const size = Math.random() * 2 + 0.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';

        starsContainer.appendChild(star);
    }
}

// ===== CANVAS SETUP =====
function initCanvas() {
    canvas = document.getElementById('connectionCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Event buttons - removed, now controlled via controller.html
    // Scenarios are started via Supabase sync from controller

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetSystem);

    // VT click handlers
    document.querySelectorAll('.vt').forEach(vt => {
        vt.addEventListener('click', (e) => {
            const vtId = e.currentTarget.dataset.vt;
            handleVTClick(vtId, e.currentTarget);
        });
    });
}

// ===== VT CLICK HANDLING =====
async function handleFirstClick(vtId, vtElement) {
    // Update Supabase if controller
    if (isController) {
        await updateSession({
            state: 'circle_resolved',
            current_step: currentStep
        });
    }

    // Execute locally
    handleFirstClickLocal(vtId, vtElement);
}

function handleFirstClickLocal(vtId, vtElement) {
    const step = currentScenario.chain[currentStep];

    // Red circle → Green circle
    vtElement.classList.remove('has-problem');
    vtElement.classList.add('resolved');

    // SDK: Hide Issue, Show Working when problem is resolved
    resolveIssue(step.vt);

    // Change line color to green for this step
    if (drawnLines[currentStep]) {
        drawnLines[currentStep].color = '#2e7d32'; // Green
        drawnLines[currentStep].resolved = true;
        redrawAllLines();
    }

    clickCount = 1;
    console.log(`Click 1: ${vtId} resolved (red → green)`);
}

async function handleSecondClick(vtId, vtElement) {
    // Check if this is the last step
    const isLastStep = currentStep >= currentScenario.chain.length - 1;

    if (isLastStep) {
        // Update Supabase if controller
        if (isController) {
            await updateSession({ state: 'success' });
        }

        // Execute locally
        handleSecondClickLocal(vtId, vtElement);

        // Show success screen
        setTimeout(async () => {
            await showSuccessScreen();
        }, 500);
    } else {
        // Update Supabase if controller - notify circle will disappear
        if (isController) {
            await updateSession({
                state: 'circle_removed',
                current_step: currentStep
            });
        }

        // Execute locally
        handleSecondClickLocal(vtId, vtElement);

        // Move to next step
        setTimeout(async () => {
            currentStep++;

            // Update Supabase if controller
            if (isController) {
                await updateSession({
                    current_step: currentStep,
                    state: 'showing_impact'
                });
            }

            await triggerStep();
        }, 500);
    }
}

function handleSecondClickLocal(vtId, vtElement) {
    // Remove green circle
    clickCount = 0;
    vtElement.classList.remove('resolved');

    console.log(`Click 2: ${vtId} proceeding to next step`);
}

function handleVTClick(vtId, vtElement) {
    // Only respond if this VT is active (has-problem or resolved state)
    if (!vtElement.classList.contains('has-problem') && !vtElement.classList.contains('resolved')) {
        return;
    }

    const step = currentScenario.chain[currentStep];
    if (step.vt !== vtId) {
        return; // Wrong VT clicked
    }

    if (clickCount === 0) {
        // First click: Red circle → Green circle
        handleFirstClick(vtId, vtElement);
    } else if (clickCount === 1) {
        // Second click: Proceed to next step
        handleSecondClick(vtId, vtElement);
    }
}

// ===== SCENARIO FLOW =====
async function startScenario(eventType) {
    // Try to take control first
    const gotControl = await takeControl();
    if (!gotControl) {
        alert('Someone else is already controlling the session. Please wait.');
        return;
    }

    // Update Supabase session
    await updateSession({
        scenario_type: eventType,
        current_step: 0,
        state: 'scenario_started'
    });

    // Execute locally
    startScenarioLocal(eventType);
}

function startScenarioLocal(eventType) {
    currentScenario = scenarios[eventType];
    currentStep = 0;
    drawnLines = []; // Reset lines array
    clickCount = 0;

    // Clear all VT states
    document.querySelectorAll('.vt').forEach(vt => {
        vt.classList.remove('has-problem', 'solving', 'resolved');
    });

    // Start the first step
    setTimeout(() => {
        triggerStep();
    }, 500);
}

// For spectators - sync to existing scenario
function startScenarioSync(eventType, step) {
    currentScenario = scenarios[eventType];
    currentStep = step;
    drawnLines = [];
    clickCount = 0;

    // Clear all VT states
    document.querySelectorAll('.vt').forEach(vt => {
        vt.classList.remove('has-problem', 'solving', 'resolved');
    });

    // Trigger the current step for sync
    setTimeout(() => {
        triggerStepLocal();
    }, 500);
}

async function triggerStep() {
    // Update Supabase if controller
    if (isController) {
        await updateSession({
            current_step: currentStep,
            state: 'showing_impact'
        });
    }

    triggerStepLocal();
}

function triggerStepLocal() {
    const step = currentScenario.chain[currentStep];
    const targetVT = document.getElementById(`vt-${step.vt}`);

    // Find source position (center of screen or previous VT)
    let sourcePos;
    if (currentStep === 0) {
        // From the center bottom of the screen (where buttons were)
        sourcePos = {
            x: window.innerWidth / 2,
            y: window.innerHeight - 100
        };
    } else {
        // From previous VT
        const prevStep = currentScenario.chain[currentStep - 1];
        const prevVT = document.getElementById(`vt-${prevStep.vt}`);
        sourcePos = getElementCenter(prevVT);
    }

    const targetPos = getElementCenter(targetVT);

    // Draw animated connection and store it
    const lineData = {
        start: sourcePos,
        end: targetPos,
        color: '#ff4444', // Red for problem
        resolved: false,
        stepIndex: currentStep
    };
    drawnLines.push(lineData);

    drawAnimatedLine(sourcePos, targetPos, '#ff4444', () => {
        // Add problem state to VT (RED CIRCLE)
        targetVT.classList.add('has-problem');

        // SDK: Show Issue, Hide Working when problem arrives
        showIssue(step.vt);

        // Reset click count for this new VT
        clickCount = 0;

        console.log(`Link arrived at ${step.vt} - waiting for clicks`);
    });
}

// For spectators to sync
function triggerStepSync() {
    triggerStepLocal();
}

async function showSuccessScreen() {
    // Update Supabase if controller
    if (isController) {
        await updateSession({ state: 'success' });
    }

    showSuccessScreenLocal();
}

function showSuccessScreenLocal() {
    const overlay = document.getElementById('successOverlay');
    const message = overlay.querySelector('.success-message');

    message.textContent = `All impacts resolved through Digital Twin collaboration!\n\n${currentScenario.name} successfully managed with minimal disruption.`;

    overlay.classList.add('show');

    // SDK: Hide "Web Cascade" and show "Web Univers" when success screen appears
    toggleVisibility("Web Cascade", false);
    toggleVisibility("Web Univers", true);
    console.log("Success screen shown - Web Cascade hidden, Web Univers displayed");
}

// For spectators to sync
function showSuccessScreenSync() {
    showSuccessScreenLocal();
}

async function resetSystem() {
    // Release control and reset session
    await releaseControl();

    resetSystemLocal();
}

function resetSystemLocal() {
    // Hide success overlay
    document.getElementById('successOverlay').classList.remove('show');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset VT states
    document.querySelectorAll('.vt').forEach(vt => {
        vt.classList.remove('has-problem', 'solving', 'resolved');
    });

    // SDK: Reset all VTs to Working state (hide all Issues, show all Working)
    ['supply', 'product', 'production'].forEach(vtType => {
        const issueActor = `Issue ${vtType.charAt(0).toUpperCase() + vtType.slice(1)}`;
        const workingActor = `Working ${vtType.charAt(0).toUpperCase() + vtType.slice(1)}`;
        toggleVisibility(issueActor, false);  // Hide Issue
        toggleVisibility(workingActor, true); // Show Working
    });

    // SDK: Reset Web Cascade and Web Univers visibility
    toggleVisibility("Web Cascade", true);   // Show Web Cascade again
    toggleVisibility("Web Univers", false);  // Hide Web Univers

    console.log("System reset - all VTs back to Working state, Web Cascade visible");

    // Reset state
    currentScenario = null;
    currentStep = 0;
    drawnLines = [];
    clickCount = 0;
}

// ===== SUPABASE INITIALIZATION =====
async function initSupabase() {
    // Initialize Supabase client using the global supabase object from CDN
    const { createClient } = supabase;
    supabaseClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // Get the session (should be only one row)
    const { data, error } = await supabaseClient
        .from('cascade_session')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching session:', error);
        return;
    }

    sessionId = data.id;
    console.log('Connected to session:', sessionId);

    // Subscribe to real-time changes
    realtimeChannel = supabaseClient
        .channel('cascade_session_changes')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'cascade_session'
            },
            handleSessionUpdate
        )
        .subscribe();

    console.log('Real-time subscription active');
}

// ===== SUPABASE SYNC FUNCTIONS =====
async function updateSession(updates) {
    if (!isController) {
        console.log('Not controller - cannot update session');
        return;
    }

    const { error } = await supabaseClient
        .from('cascade_session')
        .update(updates)
        .eq('id', sessionId);

    if (error) {
        console.error('Error updating session:', error);
    }
}

async function takeControl() {
    // Try to take control
    const { data, error } = await supabaseClient
        .from('cascade_session')
        .select('controller_id')
        .eq('id', sessionId)
        .single();

    if (error) {
        console.error('Error checking controller:', error);
        return false;
    }

    // If no controller or controller is null, take control
    if (!data.controller_id || data.controller_id === 'null') {
        const { error: updateError } = await supabaseClient
            .from('cascade_session')
            .update({ controller_id: window.USER_ID })
            .eq('id', sessionId)
            .eq('controller_id', data.controller_id); // Ensure no race condition

        if (!updateError) {
            isController = true;
            console.log('Control acquired:', window.USER_ID);
            return true;
        }
    }

    console.log('Someone else has control:', data.controller_id);
    return false;
}

async function releaseControl() {
    if (isController) {
        await supabaseClient
            .from('cascade_session')
            .update({
                controller_id: null,
                state: 'idle',
                scenario_type: null,
                current_step: 0
            })
            .eq('id', sessionId);

        isController = false;
        console.log('Control released');
    }
}

function handleSessionUpdate(payload) {
    const newData = payload.new;
    console.log('Session updated:', newData);

    // Only sync if we're NOT the controller
    // (Spectators sync everything, controllers don't sync their own updates)
    if (!isController) {
        syncFromSession(newData);
    }
}

function syncFromSession(data) {
    console.log('Syncing from session state:', data.state);

    switch (data.state) {
        case 'idle':
            if (currentScenario) {
                resetSystemLocal();
            }
            break;

        case 'scenario_started':
            if (!currentScenario || currentScenario.name !== scenarios[data.scenario_type].name) {
                startScenarioSync(data.scenario_type, data.current_step);
            }
            break;

        case 'showing_impact':
            if (currentStep !== data.current_step) {
                currentStep = data.current_step;
                triggerStepSync();
            }
            break;

        case 'circle_resolved':
            // Sync the green circle state
            syncCircleResolved(data.current_step);
            break;

        case 'circle_removed':
            // Sync the circle removal (second click)
            syncCircleRemoved(data.current_step);
            break;

        case 'success':
            showSuccessScreenSync();
            break;
    }
}

function syncCircleResolved(step) {
    // Find the VT for this step
    if (!currentScenario || currentStep !== step) {
        return;
    }

    const vtType = currentScenario.chain[currentStep].vt;
    const vtElement = document.getElementById(`vt-${vtType}`);

    if (vtElement) {
        handleFirstClickLocal(vtType, vtElement);
    }
}

function syncCircleRemoved(step) {
    // Find the VT for this step
    if (!currentScenario || currentStep !== step) {
        return;
    }

    const vtType = currentScenario.chain[currentStep].vt;
    const vtElement = document.getElementById(`vt-${vtType}`);

    if (vtElement) {
        handleSecondClickLocal(vtType, vtElement);
    }
}

// ===== DRAWING FUNCTIONS =====
function redrawAllLines() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all stored lines with their current colors
    drawnLines.forEach(line => {
        drawStaticLine(line.start, line.end, line.color);
    });
}

function drawStaticLine(start, end, color) {
    // Draw line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.stroke();

    // Draw arrowhead
    drawArrowhead(end.x, end.y, start, end, color);
}

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function drawAnimatedLine(start, end, color, callback) {
    const duration = 1000; // 1 second
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw all previous lines (except the current animating one)
        for (let i = 0; i < drawnLines.length - 1; i++) {
            const line = drawnLines[i];
            drawStaticLine(line.start, line.end, line.color);
        }

        // Calculate current end point for animating line
        const currentX = start.x + (end.x - start.x) * progress;
        const currentY = start.y + (end.y - start.y) * progress;

        // Draw animating line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();

        // Draw arrowhead at current position
        if (progress > 0.1) {
            drawArrowhead(currentX, currentY, start, end, color);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete, redraw all lines including this one
            redrawAllLines();
            if (callback) callback();
        }
    }

    animate();
}

function drawArrowhead(x, y, start, end, color) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowSize = 15;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, -arrowSize / 2);
    ctx.lineTo(-arrowSize, arrowSize / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.restore();
}
