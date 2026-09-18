# Display v3.3.1

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

## v3.3.1
- Public TV display is locked to exactly 100vw × 100vh.
- Vertical and horizontal page scrolling are disabled.
- Burn-in movement is clipped inside the viewport so its 1px shift cannot create a scrollbar.

## v3.3.2
- Added compact daily high/low beneath the current weather condition.
- Format: `H 81° • L 54°`
- High/low values come from the NWS daily forecast endpoint.
- Styling remains secondary to the current temperature.

## v3.3.5
- Combined High and Low into one compact `High / Low` metric.
- Removed separate H/L letter markers.
- Rebalanced the weather details into a cleaner four-column grid.
- Increased horizontal and vertical spacing for improved TV readability.
- Current conditions and detail metrics now have more deliberate separation.

## v3.3.7
- Repaired malformed footer markup that pushed Weather Alerts to the top of the page.
- Restored Weather Alerts to the right side of the bottom information bar.
- Increased secondary weather labels and values for TV readability.
- Kept the clean three-column weather layout:
  - Wind / Sunrise
  - Humidity / Sunset
  - Today / Precipitation

## v3.3.8
- Unified weather colors into a simple three-level hierarchy.
- Values use the same bright white.
- All weather labels use the same soft blue.
- Supporting/status text uses one muted blue-gray.
- Sunrise, Sunset, and Precipitation no longer appear artificially dimmer than Wind, Humidity, and Today.
- Admin supporting colors now use the same display palette.

## v3.3.9
- Finalized color consistency.
- All weather labels and condition text use the same soft blue.
- All weather values use the same bright white.
- Only separators and low-priority status text remain muted.
- Admin labels and values now follow the same hierarchy.
