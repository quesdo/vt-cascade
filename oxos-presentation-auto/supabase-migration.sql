-- ========================================
-- PRESENTATION SESSION TABLE MIGRATION
-- ========================================

-- Create presentation_session table
CREATE TABLE IF NOT EXISTS presentation_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    controller_id TEXT,
    state TEXT DEFAULT 'idle',
    current_slide INTEGER DEFAULT -1,
    is_running BOOLEAN DEFAULT false,
    sound_started BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial session row (only if table is empty)
INSERT INTO presentation_session (state, current_slide, is_running, sound_started)
SELECT 'idle', -1, false, false
WHERE NOT EXISTS (SELECT 1 FROM presentation_session LIMIT 1);

-- Disable RLS (private use for 4 known users)
ALTER TABLE presentation_session DISABLE ROW LEVEL SECURITY;

-- CRITICAL: Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE presentation_session;

-- Verify Realtime is enabled
SELECT schemaname, tablename,
       CASE WHEN tablename = ANY(
         SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'
       ) THEN 'enabled' ELSE 'disabled' END as realtime_status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'presentation_session';
