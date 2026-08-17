# Display v3

Fresh rebuild using plain HTML, CSS, and JavaScript modules.

## Structure
- `index.html` — public TV display
- `admin.html` — GitHub-backed admin page
- `css/styles.css` — TV display styling
- `css/admin.css` — admin styling
- `js/display.js` — clock, video, config, dynamic background, refresh
- `js/weather.js` — NWS current conditions and alerts
- `js/notices.js` — popup notice banner and rotation
- `js/admin.js` — admin form and GitHub publishing
- `config.json` — display configuration
- `locations.json` — local location fallback list

## Fixed refresh schedule
- Config check: 30 minutes
- Full page reload: 30 minutes
- Weather: 10 minutes
- NWS alerts: 5 minutes
- Notices: 10-second rotation

## Admin settings
- YouTube URL
- Show video
- Dynamic background on/off
- Notice Manager on/off
- Location
- Department notices
- GitHub repository access

## Why this rebuild
The previous version accumulated many inline CSS and JavaScript overrides. v3 separates layout, display logic, weather, notices, and admin behavior so future changes are easier to make without breaking unrelated areas.
