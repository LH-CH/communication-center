# Kalispell TV Dashboard

**Version 1.0** · Static, fullscreen TV dashboard for Kalispell, Montana.

A dark, four-quadrant dashboard optimized for a 16:9 TV display. It shows a local 24-hour clock, current weather, Flathead Electric outages, regional radar, and a persistent Flathead County weather-alert strip.

## Layout

- **Top left:** Kalispell local time (24-hour `HH:MM`, small seconds) and date.
- **Bottom left:** embedded Flathead Electric Cooperative outage map.
- **Top right:** current temperature, conditions and location, with high/low, wind, humidity, precipitation chance, sunrise and sunset.
- **Between the right panels:** NOAA/NWS weather alerts for **Flathead County, MT** (`MTC029`). When the alert API successfully confirms no alerts, the strip says **“No watches, warnings, or advisories.”**
- **Bottom right:** Windy regional radar embed, with autoplay requested.
- **Footer:** data-source credits, live weather source/connection status, update time, and alert connection status.

## Data sources

| Information | Primary | Fallback / details |
| --- | --- | --- |
| Weather readings and forecast | NOAA / National Weather Service (`api.weather.gov`) | Open-Meteo (`api.open-meteo.com`) if NOAA weather retrieval fails |
| Sunrise and sunset | Locally calculated with NOAA solar equations | May differ slightly from official published values |
| Weather watches, warnings, advisories | NOAA / National Weather Service, Flathead County `MTC029` | No substitute alert provider; feed errors are indicated |
| Power outages | Flathead Electric Cooperative outage website | Third-party iframe; provider may block embedding |
| Radar imagery | Windy embedded radar | Separate radar provider; **not** NOAA/Open-Meteo |

Weather values shown depend on the fields returned by the active source. Radar is separate from the weather-reading fallback sequence.

## Automatic refresh

| Service | Refresh |
| --- | --- |
| Clock | Every 1 second |
| Weather | Every 5 minutes, plus an early retry if initial retrieval fails |
| NWS alerts | Every 2 minutes |
| Maps and radar | Managed by embedded providers |
| Full page | Reloads every 6 hours |

The page requires an internet connection. Status details appear in the footer. If a weather request fails, previously displayed readings may remain visible; check the footer to distinguish current from stale data.

## Deploy to GitHub Pages

1. Create a GitHub repository, for example `kalispell-tv-dashboard`.
2. Upload **`index.html`** and **`README.md`** to the repository root.
3. Commit the files to the default branch (`main`).
4. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, and save.
5. Wait for GitHub Pages to publish. Open the provided site URL on your TV or browser and use fullscreen (usually **F11** on a computer).

Updating the dashboard only requires replacing `index.html` and committing the change. GitHub Pages may take a short time to deploy; reload the TV page afterward.

## TV/browser notes

- Designed for 1920 × 1080 and similar 16:9 landscape screens. Browser zoom, TV overscan, and unusual resolutions may affect fit.
- Allow network access to `api.weather.gov`, `api.open-meteo.com`, `outage.flathead.coop`, and `embed.windy.com`.
- Flathead Electric may restrict embedding. An unavailable map does **not** necessarily mean there are no outages.
- Windy autoplay (`play=1`) is a requested setting, not guaranteed on every TV browser; some browsers restrict autoplay.
- This dashboard is informational and not a replacement for official emergency notifications or weather warnings.

## Files

- `index.html` — complete dashboard, including embedded CSS and JavaScript.
- `README.md` — setup, source descriptions, refresh intervals and limitations.

No build tools, backend, or user-supplied API key are required.
