# Kalispell TV Dashboard — Release Notes

A running record of dashboard changes. Current version: **1.2**.

## v1.2 — Weather, alerts, audio and reliability

### Latest updates
- Replaced the air-quality widget with **Visibility**, using NOAA/NWS observations from KGPI (Glacier Park International Airport) in miles. Missing observations are shown as unavailable, rather than estimated.
- Added a subtle **Feels like** temperature below the current temperature. Uses wind-chill or heat-index calculations with NOAA/NWS weather data; the Open-Meteo weather fallback can provide apparent temperature.
- Kept the current temperature vertically centered, with the weather icon beside the condition text.
- Standardized and enlarged weather tile labels and values for readability on a TV.
- Split source attribution in the top header: weather source and visibility source are identified independently.
- Changed the clear-alert banner to **NO ACTIVE WEATHER ALERTS**, preserving the taller alert strip.

### Earlier v1.2 updates
- Added severity-based Flathead County weather alerts: warnings in red, watches in amber, and advisories in yellow. Multiple active alerts rotate.
- Added separate sounds for component status failures, new watches/advisories, and new or upgraded warnings. Unchanged alerts do not repeatedly chime.
- Replaced the audio text button with a speaker icon. Green indicates enabled audio; a flashing muted icon requests interaction when a browser blocks autoplay.
- Added stale-weather detection, retry/backoff for data requests, and recovery checks for delayed updates.
- Combined sunrise and sunset into one weather tile.
- Enlarged the weather headings and condition descriptions. Added the date to the last successful weather update time.
- Added a subtle brightness variation to complement always-on pixel shifting.
- Evaluated AQI sources and tested an AirNow widget before replacing that tile with visibility.

## v1.1 — TV display refinement
- Increased weather text sizes for better viewing distance.
- Moved connection and data-source information from the footer into a compact top header.
- Added health indicators for clock, weather, alerts, outage-map frame, and radar frame.
- Made pixel shifting always on and removed its toggle; reduced the header height.

## v1.0 — Initial dashboard
- Established the four-quadrant layout: Kalispell 24-hour clock, Flathead Electric outage map, current weather, and regional radar.
- Integrated NOAA/NWS primary weather data, Open-Meteo weather fallback, and Flathead County weather alerts.
- Added weather metrics including high/low, wind, humidity, precipitation probability, sunrise, and sunset.
- Included automatic updates and a dark, TV-focused presentation.

## Known limitations
- Embedded outage-map and radar status lights can verify only that an iframe loaded, **not** that its underlying information is current.
- The NOAA/NWS airport visibility reading may be unavailable or different from conditions elsewhere in Flathead County.
- Browser autoplay policies may require interaction to enable audible alerts after a reload.
- Pixel shifting and brightness adjustments can reduce static image retention but cannot guarantee prevention of burn-in.
- This dashboard supplements, but does not replace, official emergency warning methods.
