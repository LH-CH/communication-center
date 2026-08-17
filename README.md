# Display v3.2 — Reliability Update

Flat GitHub Pages build. Upload every file directly to the repository root.

## Added in v3.2

- No periodic full-page reload: YouTube playback is no longer interrupted by scheduled refreshes
- Health indicators for config, weather, alerts, and video
- Cached/offline fallback for config, weather, and alerts
- Exponential retry/backoff for NWS and config requests
- Auto-fit protection for clock, alerts, weather condition text, and notices
- Smarter notices:
  - urgent/important priority ordering
  - longer messages stay visible longer
  - urgent messages get extra display time
  - start/expiration boundaries refresh automatically
- YouTube failure fallback displays:
  - `Communication`
  - `Center`
- Subtle burn-in protection shifts the display by 1 pixel periodically
- Hidden diagnostics panel: press `D`
- Config versioning with `schemaVersion`, `revision`, and `updatedAt`
- Config is applied only when its content changes
- Last valid config is cached locally so the display can boot during a GitHub/network interruption
- Online event triggers an immediate config recovery attempt

## Background refresh schedule

- Config check: every 30 minutes
- Weather: every 10 minutes
- NWS alerts: every 5 minutes
- Burn-in pixel shift: every 10 minutes
- No forced full-page reload

## Diagnostics

Press `D` on the TV keyboard to show/hide diagnostics including:
- config version/revision
- last successful config/weather/alert updates
- network/cache source
- video state
- viewport size
- online/offline status
- location/time zone
