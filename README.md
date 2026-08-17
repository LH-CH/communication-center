# Display v3.3

Flat GitHub Pages build.

## v3.3 changes
- YouTube restored to a simple direct iframe embed
- Automatic video retry; fallback is `Communication` / `Center`
- System Status card added to Admin
- Admin header updated to v3.3
- Last published and config revision shown in Admin
- Notice Manager reliability retained: priority sorting, scheduled/active/expired behavior, adaptive display duration, expiration display
- Quiet stale-data warning after weather data is more than 2 hours old
- Midnight housekeeping recalculates date/weather/alerts/notices without a page reload
- Five-minute watchdog checks clock, config, weather, alerts, and video and recovers individual components
- No scheduled full-page reload
- Config checks every 30 minutes
- Weather every 10 minutes
- Alerts every 5 minutes

Upload all files directly to the GitHub repository root.
