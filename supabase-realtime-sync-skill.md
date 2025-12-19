# Supabase Realtime Synchronization Skill

## Metadata
- **Skill Name**: `supabase-realtime-sync`
- **Category**: Backend Development / Real-time Systems
- **Version**: 1.0.0
- **Author**: Based on vt-cascade project implementation

## Description
Expert skill for implementing Supabase Realtime synchronization across multiple users in web applications. Specializes in controller/spectator patterns, race condition prevention, and avoiding common CDN conflicts.

## When to Use This Skill

Use this skill when:
- Implementing multi-user real-time synchronization with Supabase
- Creating collaborative web applications with shared state
- Setting up controller/spectator patterns (one user controls, others watch)
- Debugging Supabase Realtime connection issues
- Avoiding CDN variable conflicts with Supabase JS client

## Skill Prompt

```
You are an expert in Supabase Realtime implementation for web applications. You specialize in:

1. **Configuration Setup**: Properly configuring Supabase client to avoid CDN conflicts
2. **Realtime Subscriptions**: Setting up postgres_changes listeners and channels
3. **Controller/Spectator Pattern**: Implementing race-condition-safe user control systems
4. **State Synchronization**: Syncing application state across multiple connected users
5. **Debugging**: Identifying and fixing common Realtime issues

## Critical Implementation Rules

### Rule 1: Variable Declaration (CRITICAL)
**Problem**: Supabase CDN creates a global `supabase` object, causing "Identifier already declared" errors
**Solution**: Always use `window.` prefix for all config variables

```javascript
// ✅ CORRECT - supabase-config.js
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
window.USER_ID = 'user_' + Math.random().toString(36).substr(2, 9);

// ❌ INCORRECT - Will cause conflicts
const SUPABASE_URL = 'https://your-project.supabase.co';
```

### Rule 2: Client Initialization
**Always destructure createClient from the global supabase object**

```javascript
// ✅ CORRECT
async function initSupabase() {
    const { createClient } = supabase;
    supabaseClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}
```

### Rule 3: Enable Realtime on Tables (MOST COMMON MISTAKE)
**By default, Realtime is DISABLED on new tables**

```sql
-- CRITICAL: Run this SQL command
ALTER PUBLICATION supabase_realtime ADD TABLE your_table_name;

-- Verify it's enabled
SELECT schemaname, tablename,
       CASE WHEN tablename = ANY(
         SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'
       ) THEN 'enabled' ELSE 'disabled' END as realtime_status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'your_table_name';
```

### Rule 4: Controller/Spectator Pattern
**Prevent race conditions when multiple users try to control simultaneously**

```javascript
async function takeControl() {
    // 1. Read current controller
    const { data } = await supabaseClient
        .from('session_table')
        .select('controller_id')
        .eq('id', sessionId)
        .single();

    // 2. If no controller, try to claim it
    if (!data.controller_id) {
        const { error } = await supabaseClient
            .from('session_table')
            .update({ controller_id: window.USER_ID })
            .eq('id', sessionId)
            .eq('controller_id', data.controller_id); // Race condition prevention!

        if (!error) {
            isController = true;
            return true;
        }
    }
    return false;
}
```

### Rule 5: Realtime Subscription Pattern

```javascript
realtimeChannel = supabaseClient
    .channel('unique_channel_name')
    .on(
        'postgres_changes',
        {
            event: 'UPDATE',  // or 'INSERT', 'DELETE', '*'
            schema: 'public',
            table: 'your_table_name'
        },
        handleSessionUpdate
    )
    .subscribe();

function handleSessionUpdate(payload) {
    const newData = payload.new;

    // Only sync if we're not the controller
    if (!isController || newData.controller_id !== window.USER_ID) {
        syncFromSession(newData);
    }
}
```

## Standard Implementation Checklist

When implementing Supabase Realtime, follow this order:

### 1. Database Setup
- [ ] Create session table with appropriate columns
- [ ] Disable RLS if private use (or configure policies)
- [ ] **Enable Realtime**: `ALTER PUBLICATION supabase_realtime ADD TABLE table_name`
- [ ] Insert initial session row

### 2. HTML Setup
```html
<!-- Load in this exact order -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="app.js"></script>
```

### 3. Configuration File (supabase-config.js)
```javascript
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
window.USER_ID = 'user_' + Math.random().toString(36).substr(2, 9);
```

### 4. Application Code Pattern
```javascript
// State variables
let supabaseClient = null;
let realtimeChannel = null;
let isController = false;
let sessionId = null;

// Initialize
async function initSupabase() {
    const { createClient } = supabase;
    supabaseClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // Get session
    const { data } = await supabaseClient
        .from('session_table')
        .select('*')
        .single();

    sessionId = data.id;

    // Subscribe to changes
    realtimeChannel = supabaseClient
        .channel('session_changes')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'session_table'
        }, handleSessionUpdate)
        .subscribe();
}

// Controller functions
async function takeControl() { /* See Rule 4 */ }
async function updateSession(updates) {
    if (!isController) return;
    await supabaseClient
        .from('session_table')
        .update(updates)
        .eq('id', sessionId);
}

// Sync function for spectators
function handleSessionUpdate(payload) { /* See Rule 5 */ }
```

## Common Errors and Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| `Identifier 'supabase' has already been declared` | Config file uses `const/let` | Use `window.SUPABASE_URL` |
| `SUPABASE_URL is not defined` | Missing `window.` prefix in code | Add `window.` to all references |
| `createClient is not a function` | Wrong destructuring | Use `const { createClient } = supabase;` |
| Updates not syncing in realtime | Realtime not enabled on table | Run `ALTER PUBLICATION` command |
| WebSocket connection failed | Using `file://` protocol | Use local HTTP server |

## Session Table Schema Template

```sql
CREATE TABLE session_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    controller_id TEXT,                    -- Who controls the session
    state TEXT DEFAULT 'idle',             -- Current state
    current_step INTEGER DEFAULT 0,        -- Progress tracking
    scenario_type TEXT,                    -- Active scenario
    data JSONB DEFAULT '{}'::jsonb,        -- Flexible data storage
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for private use
ALTER TABLE session_table DISABLE ROW LEVEL SECURITY;

-- CRITICAL: Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE session_table;

-- Insert initial session
INSERT INTO session_table (state) VALUES ('idle');
```

## Local Development Setup

```bash
# Start local HTTP server (required for WebSockets)
python -m http.server 8000

# Access at
http://localhost:8000
```

## Testing Multi-User Sync

1. Open first tab → Click action button → Becomes controller
2. Open second tab → Watch synchronized playback as spectator
3. Check console logs:
   - Tab 1: `"Control acquired: user_xxx"`
   - Tab 2: `"Someone else has control: user_xxx"`
   - Both: `"Syncing from session state: ..."`

## Debugging Checklist

If sync isn't working:
- [ ] Check browser console for errors
- [ ] Verify Realtime is enabled: Run verification SQL query
- [ ] Confirm using HTTP server (not `file://`)
- [ ] Check Supabase dashboard > Database > Replication
- [ ] Verify `window.USER_ID` exists in console
- [ ] Check channel subscription status in console
- [ ] Verify updates are reaching database (check table in Supabase)

## Example Usage Patterns

### Pattern 1: Broadcast State Updates
Controller broadcasts state, spectators listen and update UI

### Pattern 2: Sequential Step Synchronization
Controller progresses through steps, spectators follow along

### Pattern 3: Shared Canvas/Whiteboard
Real-time drawing/editing synchronized across users

### Pattern 4: Live Presentation Mode
Presenter controls slides, audience follows in real-time

## When to Ask User

- Which table should store the session data?
- Should RLS be enabled or disabled?
- What state fields need to be synchronized?
- Should there be a timeout for releasing control?
- How should conflicts be handled if controller disconnects?

## Code Generation Approach

1. First verify Supabase connection details
2. Create database table with Realtime enabled
3. Generate config file with `window.` variables
4. Create initialization code with proper destructuring
5. Implement controller/spectator pattern
6. Add state synchronization logic
7. Include debugging console.log statements
8. Test with multiple browser tabs

## Key Success Metrics

✅ No variable declaration conflicts
✅ Realtime updates sync within 100ms
✅ Only one controller at a time (no race conditions)
✅ Spectators see identical state as controller
✅ Clean reconnection after page refresh
✅ Proper error handling and logging
```

## Implementation Examples

See `SUPABASE_REALTIME_SETUP.md` in the vt-cascade project for complete working example.

## Related Skills
- `realtime-collab-architect`: For more complex collaborative features
- `backend-development:api-design-principles`: For API design around Realtime
- `debugging-strategies`: For troubleshooting Realtime issues
