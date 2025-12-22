-- Reset presentation session to idle state
UPDATE presentation_session
SET
    controller_id = NULL,
    state = 'idle',
    current_slide = -1,
    is_running = false,
    sound_started = false,
    updated_at = NOW();
