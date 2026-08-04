# Dashboard

A minimal single-screen dashboard hosted with GitHub Pages.

## Features
- Responsive 24-hour clock and date
- YouTube video feed
- Current National Weather Service conditions
- Wind, humidity, sunrise, and sunset
- Scheduled rotating notices
- Active weather alerts
- Automatic configuration checks and local fallback caching

## Files
- `index.html` — display interface and application logic
- `config.json` — location, video, refresh intervals, and notices

Weather icons are embedded as lightweight inline SVG graphics. No external icon package is required.

## Updating the display
Edit `config.json` in GitHub and commit the change. The open display checks for updates automatically.
