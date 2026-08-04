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


The current-conditions area uses a compact weather summary and aligned 2×2 metrics grid with embedded minimal SVG icons.


## Automatic refresh

The display automatically:

- Checks `config.json` using `configRefreshSeconds`
- Refreshes current weather using `weatherRefreshMinutes`
- Refreshes alerts using `alertsRefreshMinutes`
- Reloads the entire page using `pageRefreshMinutes`

Default values are already included in `config.json`. A timestamp is added to configuration requests to prevent browser caching.
