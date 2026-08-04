# Communication Center TV Display

A static, no-backend TV dashboard for GitHub Pages.

## Files
- `index.html` — complete dashboard
- `config.json` — editable display settings, video, location, and notice queue
- `background.png` — full-screen background
- weather icon files — local fallback/condition assets

## Update the display
Edit `config.json` in GitHub and commit the change. The TV checks for updates every 30 seconds. GitHub Pages publishing can take a minute or two.

## Notice scheduling
Each notice supports `message`, `start`, `expires`, and `priority` (`normal`, `important`, or `urgent`). Blank dates mean immediate/no expiration. Dates should be ISO format, for example `2026-08-05T08:00:00-06:00`.

## GitHub Pages
Repository Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
