// ===== STATE MANAGEMENT =====
let supabaseClient = null;
let realtimeChannel = null;
let isController = false;
let sessionId = null;
let isLocalSOLAction = false;
let lastKnownSolCounter = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    await initSupabase();
    initEventListeners();
    console.log("Controller initialized - User ID:", window.USER_ID);
});

// ===== SUPABASE INITIALIZATION =====
async function initSupabase() {
    const { createClient } = supabase;
    supabaseClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    const sessionKey = new URLSearchParams(window.location.search).get('session') || 'default';
    console.log('Session key:', sessionKey);

    let { data, error } = await supabaseClient
        .from('cascade_session')
        .select('*')
        .eq('session_key', sessionKey)
        .single();

    if (error || !data) {
        const { data: newRow, error: insertError } = await supabaseClient
            .from('cascade_session')
            .insert({ session_key: sessionKey, state: 'idle', current_step: 0 })
            .select().single();
        if (insertError) { console.error('Error creating session:', insertError); updateStatus('Error connecting to database', false); return; }
        data = newRow;
    }

    sessionId = data.id;
    lastKnownSolCounter = data.sol_action_counter || 0;
    console.log('Connected to session:', sessionId, '(key:', sessionKey, ')');
    updateStatus('Connected', true);

    // Subscribe to real-time changes
    realtimeChannel = supabaseClient
        .channel(`cascade_controller_${sessionKey}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'cascade_session',
                filter: `id=eq.${sessionId}`
            },
            handleSessionUpdate
        )
        .subscribe();

    console.log('Real-time subscription active');
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Crisis buttons
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const eventType = e.currentTarget.dataset.event;
            await startScenario(eventType);
        });
    });

    // Solution buttons
    document.querySelectorAll('.sol-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const solution = e.currentTarget.dataset.solution;
            toggleSolutionVisibility(solution);
        });
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetSystem);
}

// ===== SOLUTION VISIBILITY CONTROL =====
function executeSOLLocally(solutionName) {
    console.log(`Toggling visibility for: ${solutionName}`);

    window.parent.postMessage(JSON.stringify({
        action: "toggleVisibility",
        actor: solutionName,
        visible: true
    }), "*");

    console.log(`Visibility toggled for ${solutionName}`);

    if (solutionName === 'SOL2') {
        const rotNumber = Math.floor(Math.random() * 3) + 1;
        const rotAnimationName = `ROT${rotNumber}`;
        console.log(`Playing rotation animation ${rotAnimationName} on ${solutionName}`);
        playAnimation(solutionName, rotAnimationName);
        const animationName = solutionName.replace('SOL', 'ANIM');
        setTimeout(() => {
            playAnimation(solutionName, animationName);
        }, 3000);
    } else {
        const animationName = solutionName.replace('SOL', 'ANIM');
        setTimeout(() => {
            playAnimation(solutionName, animationName);
        }, 3000);
    }
}

async function toggleSolutionVisibility(solutionName) {
    // Execute locally
    executeSOLLocally(solutionName);

    // Sync to Supabase so other users execute too
    if (supabaseClient && sessionId) {
        isLocalSOLAction = true;
        const { error } = await supabaseClient
            .from('cascade_session')
            .update({
                last_sol_action: solutionName,
                sol_action_counter: Date.now()
            })
            .eq('id', sessionId);
        if (error) console.error('Error syncing SOL action:', error);
        else console.log('SOL action synced:', solutionName);
    }
}

function playAnimation(actorName, animationName) {
    console.log(`Playing animation ${animationName} on ${actorName}`);

    window.parent.postMessage(JSON.stringify({
        action: "playAnimation",
        actor: actorName,
        animation: animationName
    }), "*");

    console.log(`Animation ${animationName} triggered`);
}

// ===== SCENARIO CONTROL =====
async function startScenario(eventType) {
    // Try to take control
    const gotControl = await takeControl();
    if (!gotControl) {
        alert('Someone else is already controlling the session. Please wait.');
        return;
    }

    // Disable all buttons
    document.querySelectorAll('.control-btn').forEach(btn => btn.disabled = true);

    // Update session
    await updateSession({
        scenario_type: eventType,
        current_step: 0,
        state: 'scenario_started'
    });

    console.log(`Started scenario: ${eventType}`);
}

async function resetSystem() {
    // Release control and reset
    await releaseControl();

    // Re-enable buttons
    document.querySelectorAll('.control-btn').forEach(btn => btn.disabled = false);

    updateStatus('Connected', true);
    console.log('System reset');
}

// ===== SUPABASE FUNCTIONS =====
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
    const { data, error } = await supabaseClient
        .from('cascade_session')
        .select('controller_id')
        .eq('id', sessionId)
        .single();

    if (error) {
        console.error('Error checking controller:', error);
        return false;
    }

    // If no controller, take control
    if (!data.controller_id || data.controller_id === 'null') {
        const { error: updateError } = await supabaseClient
            .from('cascade_session')
            .update({ controller_id: window.USER_ID })
            .eq('id', sessionId)
            .eq('controller_id', data.controller_id);

        if (!updateError) {
            isController = true;
            updateStatus('Controlling', true);
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
        updateStatus('Connected', true);
        console.log('Control released');
    }
}

function handleSessionUpdate(payload) {
    const newData = payload.new;
    const oldData = payload.old;
    console.log('Session updated:', newData);

    // Handle remote SOL action sync
    if (newData.last_sol_action && newData.sol_action_counter !== lastKnownSolCounter) {
        lastKnownSolCounter = newData.sol_action_counter;
        if (isLocalSOLAction) {
            isLocalSOLAction = false;
            console.log('Local SOL action confirmed:', newData.last_sol_action);
        } else {
            console.log('Remote SOL action received:', newData.last_sol_action);
            executeSOLLocally(newData.last_sol_action);
        }
    }

    // Update button states based on session state
    if (newData.state === 'idle') {
        document.querySelectorAll('.control-btn').forEach(btn => btn.disabled = false);
        if (isController) {
            isController = false;
            updateStatus('Connected', true);
        }
    } else if (newData.state === 'scenario_started' || newData.state === 'showing_impact') {
        document.querySelectorAll('.control-btn').forEach(btn => btn.disabled = true);
    }
}

// ===== UI UPDATES =====
function updateStatus(text, connected) {
    const indicator = document.getElementById('statusIndicator');
    const statusText = indicator.querySelector('.status-text');

    statusText.textContent = text;

    indicator.classList.remove('connected', 'controlling');

    if (connected) {
        indicator.classList.add('connected');
    }

    if (isController) {
        indicator.classList.add('controlling');
    }
}
