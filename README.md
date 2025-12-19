# VT Cascade - Digital Twin Crisis Demonstration

Interactive real-time demonstration of how Digital Twins resolve cascade crisis scenarios across supply chain, product, and production systems.

## Features

- **3 Crisis Scenarios**:
  - 🔴 Tariff Increase (+25%)
  - 🟠 Labor Shortage Crisis
  - 🟣 Material Change Required

- **Real-time Multi-User Synchronization**:
  - First user to click controls the scenario
  - Other users watch in perfect sync
  - Powered by Supabase Realtime

- **Automatic Progression**:
  - Impact display (6 seconds)
  - Solution display (6 seconds)
  - Visual countdown and progress indicators
  - Click to skip ahead

- **Visual Cascade Effects**:
  - Animated connection lines between VTs
  - Color-coded impact (red) to resolution (green)
  - Clear causality between cascade steps

## Technologies

- Vanilla JavaScript
- Supabase Realtime for multi-user sync
- Canvas API for animated visualizations
- CSS animations

## Live Demo

🌐 [View Live Demo](https://your-username.github.io/vt-cascade)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/vt-cascade.git
cd vt-cascade
```

2. Start a local server:
```bash
python -m http.server 8000
```

3. Open in browser:
```
http://localhost:8000
```

## Supabase Setup

This project uses Supabase for real-time synchronization. See [SUPABASE_REALTIME_SETUP.md](SUPABASE_REALTIME_SETUP.md) for detailed setup instructions.

### Quick Setup:

1. Create a Supabase project
2. Run the migration to create the `cascade_session` table
3. Enable Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE cascade_session;`
4. Update `supabase-config.js` with your credentials

## Project Structure

```
vt-cascade/
├── index.html              # Main HTML structure
├── styles.css              # Styling and animations
├── app.js                  # Main application logic
├── supabase-config.js      # Supabase configuration
├── SUPABASE_REALTIME_SETUP.md    # Setup guide
└── supabase-realtime-sync-skill.md  # Skill documentation
```

## How It Works

1. **User clicks a crisis scenario button**
2. **System attempts to take control** (race-condition safe)
3. **Animated line draws** to affected Virtual Twin
4. **Impact message displays** for 6 seconds
5. **Solution automatically shows** after 6 seconds
6. **Line turns green** to indicate resolution
7. **Process repeats** for cascade effects
8. **All connected users** see identical progression in real-time

## Documentation

- [Supabase Realtime Setup Guide](SUPABASE_REALTIME_SETUP.md)
- [Skill Implementation](supabase-realtime-sync-skill.md)
- [Installation Guide](HOW_TO_INSTALL_SKILL.md)

## Contributing

This is a demonstration project. Feel free to fork and adapt for your own use cases.

## License

MIT

## Author

Created as a demonstration of Digital Twin crisis management with real-time collaboration.
