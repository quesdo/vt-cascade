// ===== PRESENTATION DATA WITH TIMINGS =====
const slides = [
    {
        text: "Virtual Twin of the Product\n\nAt OXOS, the virtual twin is not just a 3D model.\nIt is the single, complete, and living reference of the product.",
        media: null,
        duration: 8000 // 8s
    },
    {
        text: "It concentrates all the product's intelligence in one place:\ndetailed bill of materials, exact configurations, manufacturing constraints, engineering and certification data, material history.",
        media: "PRD 1",
        duration: 13000 // 21s - 8s = 13s
    },
    {
        text: "Before a single machine is powered on, we already know the predicted cycle time, material costs, geometric risks, and even the environmental footprint.",
        media: "PRD 2",
        duration: 9000 // 30s - 21s = 9s
    },
    {
        text: "This virtual twin feeds OXOS's generative AI.\nConcretely, for the manufacturing of a housing, OXOS automatically generates the optimal machining sequence, the associated 5-axis CNC program, and the relevant quality inspections to fits with A&D regulations.",
        media: "PRD 3",
        duration: 17000 // 47s - 30s = 17s
    },
    {
        text: "In production, the virtual twin tracks progress, quality status, and process deviations in real time.\nIn engineering and compliance, it ensures full traceability — from as-specified to as-maintained — with certification reports generated automatically.",
        media: "PRD 4",
        duration: 18000 // 65s - 47s = 18s
    },
    {
        text: "With OXOS, industry moves from reactive execution\nto a predictive process, continuously auditable.",
        media: "PRD Content",
        duration: 0 // Last slide - no auto progression
    }
];

// ===== STATE MANAGEMENT =====
let currentSlide = -1; // Start at -1 to show intro
let activeMedia = null; // Track currently visible media
let soundStarted = false; // Track if PRD Sound has been shown
let autoProgressTimer = null; // Timer for auto progression
let isPresentationRunning = false; // Track if presentation is running

// ===== SUPABASE REAL-TIME SYNC =====
let supabaseClient = null;
let realtimeChannel = null;
let isController = false; // Am I controlling the presentation?
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

// Function to show 3D media
function showMedia(mediaName) {
    if (mediaName) {
        toggleVisibility(mediaName, true);
        activeMedia = mediaName;
        console.log(`Showing 3D object: ${mediaName}`);
    }
}

// Function to hide 3D media
function hideMedia(mediaName) {
    if (mediaName) {
        toggleVisibility(mediaName, false);
        console.log(`Hiding 3D object: ${mediaName}`);
    }
}

// Function to hide all media
function hideAllMedia() {
    const allMedia = ["PRD 1", "PRD 2", "PRD 3", "PRD 4", "PRD Content"];
    allMedia.forEach(media => {
        toggleVisibility(media, false);
    });
    activeMedia = null;
    console.log("All 3D objects hidden");
}

// Function to hide AS IS Product only when presentation starts
function hideASISProduct() {
    toggleVisibility("AS IS Product", false);
    console.log("AS IS Product hidden");
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    initStars();
    await initSupabase();
    initPresentation();

    console.log("OXOS Presentation loaded - SDK ready");
    console.log("Supabase Real-time sync enabled - User ID:", window.USER_ID);
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

// ===== PRESENTATION LOGIC =====
function initPresentation() {
    const nextBtn = document.getElementById('nextBtn');
    const resetBtn = document.getElementById('resetBtn');
    const textContent = document.getElementById('textContent');

    // Hide all PRD media at start (but NOT AS IS Product yet)
    hideAllMedia();

    // Hide PRD Sound initially
    toggleVisibility("PRD Sound", false);

    // Show intro state
    setTimeout(() => {
        textContent.classList.add('show');
        nextBtn.classList.add('show');
        resetBtn.classList.add('show');
    }, 300);

    // Next button click handler
    nextBtn.addEventListener('click', async () => {
        // Anyone can start/control the presentation
        if (!isController && !isPresentationRunning) {
            await takeControl(); // Try to take control, but don't block if someone else has it
        }

        await nextSlide();
    });

    // Reset button click handler
    resetBtn.addEventListener('click', async () => {
        await restartPresentation();
    });

    // Update progress
    updateProgress();
}

async function nextSlide() {
    const textContent = document.getElementById('textContent');
    const slideText = textContent.querySelector('.slide-text');
    const nextBtn = document.getElementById('nextBtn');

    // On first click, show PRD Sound and start auto presentation
    if (!soundStarted) {
        toggleVisibility("PRD Sound", true);
        soundStarted = true;
        isPresentationRunning = true;

        // Hide the button during auto-presentation
        nextBtn.style.display = 'none';

        // Update Supabase if controller
        if (isController) {
            await updateSession({
                state: 'presentation_started',
                is_running: true,
                sound_started: true
            });
        }
    }

    // Clear any existing timer
    if (autoProgressTimer) {
        clearTimeout(autoProgressTimer);
        autoProgressTimer = null;
    }

    // Don't hide previous media - keep them visible!
    // Each new media adds to the scene

    // Move to next slide
    currentSlide++;

    // Check if presentation is complete
    if (currentSlide >= slides.length) {
        // End of presentation
        isPresentationRunning = false;

        // Update Supabase if controller
        if (isController) {
            await updateSession({
                state: 'presentation_ended'
            });
        }

        showEndScreen();
        return;
    }

    // Update Supabase with new slide if controller
    if (isController) {
        await updateSession({
            state: 'slide_changed',
            current_slide: currentSlide
        });
    }

    // Animate out current text
    textContent.classList.remove('show');
    textContent.classList.add('slide-out');

    setTimeout(() => {
        // Update text content
        const slide = slides[currentSlide];
        slideText.textContent = slide.text;

        // Show new media if present (without hiding previous ones)
        if (slide.media) {
            showMedia(slide.media);

            // Hide AS IS Product when showing PRD Content (last media)
            if (slide.media === "PRD Content") {
                hideASISProduct();
            }
        }

        // Animate in new text
        textContent.classList.remove('slide-out');
        textContent.classList.add('slide-in');

        setTimeout(() => {
            textContent.classList.remove('slide-in');
            textContent.classList.add('show');
        }, 100);

        // Update progress
        updateProgress();

        // Auto-progress to next slide if duration is set and presentation is running
        if (isPresentationRunning && slide.duration > 0) {
            autoProgressTimer = setTimeout(() => {
                nextSlide();
            }, slide.duration);
        } else if (currentSlide === slides.length - 1) {
            // Last slide - show finish button
            nextBtn.style.display = 'block';
            nextBtn.querySelector('.btn-text').textContent = 'Finish';
        }
    }, 500);
}

function showEndScreen() {
    const textContent = document.getElementById('textContent');
    const slideText = textContent.querySelector('.slide-text');
    const nextBtn = document.getElementById('nextBtn');

    // Animate out
    textContent.classList.remove('show');
    nextBtn.classList.remove('show');

    setTimeout(() => {
        slideText.innerHTML = '<strong>Thank you</strong><br>Presentation Complete';

        textContent.classList.add('show');

        // Change button to restart
        nextBtn.querySelector('.btn-text').textContent = 'Restart Presentation';
        nextBtn.querySelector('.btn-icon').textContent = '↻';
        nextBtn.onclick = restartPresentation;

        setTimeout(() => {
            nextBtn.classList.add('show');
        }, 500);
    }, 600);
}

async function restartPresentation() {
    // Release control and reset session
    await releaseControl();

    restartPresentationLocal();
}

function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    const total = slides.length;
    const current = Math.max(0, currentSlide + 1);
    const percentage = (current / total) * 100;

    // Update progress bar
    progressBar.style.setProperty('--progress', percentage + '%');
    progressBar.querySelector('::after') || (progressBar.style.background = `linear-gradient(90deg, #1976d2 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`);

    // Simpler approach - directly set width via inline style
    const barFill = document.createElement('div');
    barFill.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: ${percentage}%;
        background: linear-gradient(90deg, #1976d2, #4da6ff);
        border-radius: 10px;
        transition: width 0.6s ease;
        box-shadow: 0 0 10px rgba(77, 166, 255, 0.8);
    `;

    // Clear and add new fill
    progressBar.innerHTML = '';
    progressBar.appendChild(barFill);

    // Update text
    progressText.textContent = `${current} / ${total}`;
}

// ===== SUPABASE INITIALIZATION =====
async function initSupabase() {
    try {
        // Check if Supabase CDN is loaded
        if (typeof supabase === 'undefined') {
            console.error('Supabase CDN not loaded');
            return;
        }

        // Initialize Supabase client using the global supabase object from CDN
        const { createClient } = supabase;
        supabaseClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

        // Get the session (should be only one row)
        const { data, error } = await supabaseClient
            .from('presentation_session')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching session:', error);
            return;
        }

        sessionId = data.id;
        console.log('Connected to presentation session:', sessionId);

        // If presentation is already running, late joiners wait at start screen
        if (data.is_running && data.state !== 'idle') {
            console.log('Presentation in progress - waiting at start screen for next launch');
            isController = false;
            // Don't sync to current state - user stays at start screen
        }

        // Subscribe to real-time changes
        realtimeChannel = supabaseClient
            .channel('presentation_session_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'presentation_session'
                },
                handleSessionUpdate
            )
            .subscribe();

        console.log('Real-time subscription active');
    } catch (err) {
        console.error('Supabase initialization error:', err);
        // Continue anyway - presentation will work in standalone mode
    }
}

// ===== SUPABASE SYNC FUNCTIONS =====
async function updateSession(updates) {
    if (!supabaseClient) {
        console.warn('Supabase not initialized - cannot update session');
        return;
    }

    if (!isController) {
        console.log('Not controller - cannot update session');
        return;
    }

    console.log('Updating session:', updates);
    const { error } = await supabaseClient
        .from('presentation_session')
        .update(updates)
        .eq('id', sessionId);

    if (error) {
        console.error('Error updating session:', error);
    } else {
        console.log('Session updated successfully:', updates);
    }
}

async function takeControl() {
    if (!supabaseClient) {
        console.warn('Supabase not initialized - cannot take control');
        return false;
    }

    // Anyone can take control at any time (like vt-cascade)
    console.log('Taking control...');
    const { error } = await supabaseClient
        .from('presentation_session')
        .update({ controller_id: window.USER_ID })
        .eq('id', sessionId);

    if (!error) {
        isController = true;
        console.log('✓ Control acquired:', window.USER_ID);
        return true;
    } else {
        console.error('✗ Error taking control:', error);
        return false;
    }
}

async function releaseControl() {
    if (isController) {
        await supabaseClient
            .from('presentation_session')
            .update({
                controller_id: null,
                state: 'idle',
                current_slide: -1,
                is_running: false,
                sound_started: false
            })
            .eq('id', sessionId);

        isController = false;
        console.log('Control released');
    }
}

function handleSessionUpdate(payload) {
    const newData = payload.new;
    console.log('🔔 Realtime event received:', newData);
    console.log('Am I controller?', isController, 'My ID:', window.USER_ID);

    // Only sync if we're NOT the controller
    // (Spectators sync everything, controllers don't sync their own updates)
    if (!isController) {
        console.log('→ Syncing as spectator');
        syncFromSession(newData);
    } else {
        console.log('→ Ignoring (I am controller)');
    }
}

function syncFromSession(data) {
    console.log('Syncing from session state:', data.state, 'slide:', data.current_slide);

    switch (data.state) {
        case 'idle':
            if (isPresentationRunning) {
                restartPresentationLocal();
            }
            break;

        case 'presentation_started':
            // Start presentation for all connected users (not late joiners)
            if (!isPresentationRunning && !soundStarted) {
                // We're at the start screen and presentation just started
                // This means we were waiting and someone clicked Start
                console.log('→ Starting presentation (not a late joiner)');
                startPresentationSync(data);
            } else if (isPresentationRunning) {
                // Already in presentation, just sync slide position
                if (currentSlide !== data.current_slide) {
                    syncToSlide(data.current_slide, data.sound_started);
                }
            }
            break;

        case 'slide_changed':
            // Only sync slides if we're already in the presentation
            if (isPresentationRunning && currentSlide !== data.current_slide) {
                syncToSlide(data.current_slide, data.sound_started);
            }
            break;

        case 'presentation_ended':
            // Only show end screen if we were in the presentation
            if (isPresentationRunning || soundStarted) {
                showEndScreenLocal();
            }
            break;
    }
}

// Sync functions for spectators
function startPresentationSync(data) {
    const nextBtn = document.getElementById('nextBtn');

    // Show PRD Sound
    if (data.sound_started && !soundStarted) {
        toggleVisibility("PRD Sound", true);
        soundStarted = true;
    }

    isPresentationRunning = true;

    // IMPORTANT: Disable button for spectators - they can't control
    nextBtn.style.display = 'none';
    nextBtn.disabled = true;

    // Sync to current slide
    syncToSlide(data.current_slide, data.sound_started);

    console.log('Spectator: presentation started, syncing to slide', data.current_slide);
}

function syncToSlide(slideIndex, soundStartedValue) {
    const textContent = document.getElementById('textContent');
    const slideText = textContent.querySelector('.slide-text');

    // Update sound state
    if (soundStartedValue && !soundStarted) {
        toggleVisibility("PRD Sound", true);
        soundStarted = true;
    }

    // Clear any existing timer
    if (autoProgressTimer) {
        clearTimeout(autoProgressTimer);
        autoProgressTimer = null;
    }

    // Update current slide
    currentSlide = slideIndex;

    // Check if valid slide
    if (currentSlide < 0 || currentSlide >= slides.length) {
        return;
    }

    const slide = slides[currentSlide];

    // Show all media up to current slide (cumulative display)
    for (let i = 0; i <= currentSlide; i++) {
        const s = slides[i];
        if (s.media) {
            showMedia(s.media);

            // Hide AS IS Product if showing PRD Content
            if (s.media === "PRD Content") {
                hideASISProduct();
            }
        }
    }

    // Update text
    slideText.textContent = slide.text;
    textContent.classList.remove('slide-out', 'slide-in');
    textContent.classList.add('show');

    // Update progress
    updateProgress();

    // Auto-progress if duration is set
    if (isPresentationRunning && slide.duration > 0) {
        autoProgressTimer = setTimeout(() => {
            nextSlide();
        }, slide.duration);
    } else if (currentSlide === slides.length - 1) {
        // Last slide - show finish button for controller only
        if (isController) {
            const nextBtn = document.getElementById('nextBtn');
            nextBtn.style.display = 'block';
            nextBtn.querySelector('.btn-text').textContent = 'Finish';
        }
    }

    console.log('Spectator: synced to slide', currentSlide);
}

function showEndScreenLocal() {
    const textContent = document.getElementById('textContent');
    const slideText = textContent.querySelector('.slide-text');
    const nextBtn = document.getElementById('nextBtn');

    // Animate out
    textContent.classList.remove('show');
    nextBtn.classList.remove('show');

    setTimeout(() => {
        slideText.innerHTML = '<strong>Thank you</strong><br>Presentation Complete';
        textContent.classList.add('show');

        // Change button to restart (only for controller)
        if (isController) {
            nextBtn.querySelector('.btn-text').textContent = 'Restart Presentation';
            nextBtn.querySelector('.btn-icon').textContent = '↻';
            nextBtn.onclick = restartPresentation;

            setTimeout(() => {
                nextBtn.classList.add('show');
            }, 500);
        }
    }, 600);
}

function restartPresentationLocal() {
    // Clear any running timer
    if (autoProgressTimer) {
        clearTimeout(autoProgressTimer);
        autoProgressTimer = null;
    }

    // Hide all media
    hideAllMedia();

    // Show AS IS Product again
    toggleVisibility("AS IS Product", true);

    // Hide PRD Sound
    toggleVisibility("PRD Sound", false);

    // Reset state
    currentSlide = -1;
    soundStarted = false;
    isPresentationRunning = false;

    // Reset button
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.style.display = 'block';
    nextBtn.querySelector('.btn-text').textContent = 'Start Presentation';
    nextBtn.querySelector('.btn-icon').textContent = '→';
    nextBtn.onclick = async () => {
        // Anyone can start
        if (!isController) {
            await takeControl();
        }
        await nextSlide();
    };

    // Reset content
    const textContent = document.getElementById('textContent');
    const slideText = textContent.querySelector('.slide-text');
    slideText.textContent = '';

    // Update progress
    updateProgress();

    console.log('Presentation restarted locally');
}
