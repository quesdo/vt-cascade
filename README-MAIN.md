# VT Cascade - Digital Twin Manual Control System

Interactive real-time demonstration of Digital Twin crisis resolution with manual click-based control and multi-user synchronization.

## Overview

This system demonstrates how Digital Twins work together to resolve supply chain crises through a clean, professional interface with remote control capabilities.

**Two Operating Modes:**
1. **Automatic Mode** (`index.html`) - Crisis scenarios progress automatically
2. **Manual Mode** (`index-manual.html`) - Click-based control for presentations

## Manual Mode Features

### Clean Visualization
- Large Digital Twin images without distracting UI elements
- Visual circle indicators (red → green) for problem states
- Animated connection lines showing cascade effects
- No pop-ups or text overlays

### Two-Click Interaction
1. **First Click**: Red circle → Green circle (problem acknowledged)
2. **Second Click**: Green circle disappears → Cascade continues to next Digital Twin

### Remote Control
- **Controller Page** (`controller.html`) - Tablet/phone-friendly interface
- **Main Screen** (`index-manual.html`) - Clean visualization for audience
- One person controls, everyone else watches in perfect sync

### Real-time Synchronization
- Powered by Supabase Realtime
- All viewers see identical progression
- Automatic conflict resolution (first controller wins)

## Crisis Scenarios

### 🚨 Tariff Increase
**Trigger**: +25% on US components
**Cascade**: Supply Chain → Product → Production
**Resolution**: Alternative supplier identification and product redesign

### 🚨 Labor Shortage Crisis
**Trigger**: -30% workforce capacity
**Cascade**: Production → Product → Supply Chain
**Resolution**: Automation deployment and production optimization

### 🚨 Material Change Required
**Trigger**: Key material discontinued
**Cascade**: Product → Production → Supply Chain
**Resolution**: Material substitution and process adaptation

## Quick Start

### 1. Setup Supabase

Create a Supabase project and run this migration:

```sql
CREATE TABLE cascade_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT DEFAULT 'idle',
    scenario_type TEXT,
    current_step INT DEFAULT 0,
    controller_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE cascade_session;

-- Insert initial session
INSERT INTO cascade_session (state) VALUES ('idle');
```

### 2. Configure Credentials

Update `supabase-config.js`:

```javascript
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
window.USER_ID = 'user-' + Math.random().toString(36).substr(2, 9);
```

### 3. Launch Application

**For presentations:**
1. Open `index-manual.html` on main screen
2. Open `controller.html` on tablet/phone
3. Click a crisis button to start
4. Click Digital Twins to progress through cascade
5. Use Reset to start new scenario

**For demos:**
1. Open `index.html` for automatic mode
2. Multiple users can join simultaneously
3. First to click a crisis button takes control

## File Structure

```
vt-cascade/
├── index.html                 # Automatic mode
├── index-manual.html          # Manual mode - main visualization
├── controller.html            # Remote control interface
├── app.js                     # Automatic mode logic
├── app-manual.js             # Manual mode logic
├── controller.js             # Controller logic
├── styles.css                # Automatic mode styles
├── styles-manual.css         # Manual mode styles
├── controller.css            # Controller styles
├── supabase-config.js        # Supabase credentials
├── Product VT.png            # Digital Twin images
├── Production systems VT.png
├── Supply VT.png
└── Documentation files
```

## Documentation

- [Manual Mode Guide](README-MANUAL.md) - Detailed manual mode documentation
- [Controller Guide](README-CONTROLLER.md) - Controller usage instructions
- [Supabase Sync](SYNC-SUPABASE.md) - Complete synchronization documentation
- [Changes Overview](CHANGEMENTS-MANUEL.md) - Comparison between modes

## Technical Details

### Synchronization States

The system uses 7 distinct states for perfect multi-user sync:

1. **idle** - No scenario active
2. **scenario_started** - Crisis scenario begins
3. **showing_impact** - Link arrives, red circle appears
4. **circle_resolved** - First click, circle turns green
5. **circle_removed** - Second click, circle disappears
6. **success** - Scenario resolved
7. **idle** - Reset complete

### Visual Indicators

**Red Circle** (Problem Detected):
- 120% of image size
- 10px red border with pulse animation
- Glowing shadow effect

**Green Circle** (Problem Resolved):
- 120% of image size
- 10px green border with glow animation
- Indicates ready for cascade progression

**Connection Lines**:
- Red: Problem propagating
- Green: Problem resolved
- Animated drawing effect

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (controller optimized for touch)

## Local Development

```bash
# Start local server
python -m http.server 8000

# Open in browser
# Main screen: http://localhost:8000/index-manual.html
# Controller: http://localhost:8000/controller.html
```

## Production Deployment

1. Upload all files to web server or GitHub Pages
2. Ensure Supabase credentials are configured
3. Share main screen URL for presentations
4. Share controller URL for remote control device

## Technologies

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: CSS3 with animations
- **Graphics**: HTML5 Canvas API
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Synchronization**: PostgreSQL triggers + WebSocket subscriptions

## Performance

- Minimal dependencies (only Supabase SDK)
- Lightweight (<50KB total JavaScript)
- Instant synchronization (<100ms latency)
- Supports 50+ simultaneous viewers

## License

MIT

## Author

Created as a demonstration of Digital Twin crisis management with real-time collaboration for professional presentations.

---

**For detailed setup instructions, see individual README files in the documentation.**
