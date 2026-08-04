# Static Display with GitHub Admin

Files:

- `index.html` — public display
- `config.json` — display settings and notices
- `admin.html` — browser-based editor that writes `config.json` through the GitHub Contents API

## Admin URL

After uploading, open:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/admin.html`

## One-time token setup

Create a fine-grained GitHub personal access token limited to this repository with:

- Repository permission: **Contents — Read and write**
- A reasonable expiration date

Paste the token into the admin page. The token is kept in `sessionStorage`, which means it remains only in the current browser tab/session and is not written into the repository.

## Security

The admin HTML is publicly viewable on GitHub Pages, but it cannot save without a valid GitHub token. Never embed a token in `admin.html`, `config.json`, or any committed file.


## Vertical notice rotation

When multiple notices are active, the notice panel moves vertically to the next notice.

The interval is controlled in `config.json`:

```json
"noticeRotationSeconds": 10
```

The transition is a smooth vertical slide. Set the value to the number of seconds each notice should remain visible.


## Notice preservation fix

The admin page now:

- Never writes or deletes notices when loading
- Preserves the latest notices from GitHub unless the Notice Manager was intentionally edited
- Re-fetches the latest `config.json` before saving
- Merges changes against the newest GitHub version
- Warns before discarding unsaved notice edits


## Stacked scrolling notices

Active notices are shown as a vertical stack. The current notice is centered at full opacity. The notices immediately above and below remain visible but fade toward the panel edges.

The stack advances automatically using:

```json
"noticeRotationSeconds": 10
```

The panel loops through all active notices and keeps the counter synchronized.


## Safe notice loading

The admin page now prevents an empty GitHub notice list from silently clearing notices.

It also:

- Saves an automatic local notice backup in the admin browser
- Requires confirmation before replacing existing notices with an empty remote list
- Includes a **Restore notices** button
- Updates the backup while notices are typed, scheduled, added, removed, or saved


## Notice expiration display

When an active notice has an expiration time, the display shows a subtle label in the lower-left corner of the notice panel.

Examples:

- `Expires 18:30`
- `Expires Aug 5 · 08:00`

Notices without an expiration remain visually unchanged.


## Collapsible repository access

The Repository access section is collapsed by default.

- Press `+` to expand it
- Press `−` to collapse it
- The section contains repository owner, repository name, branch, config path, and token controls


## Searchable display location

The admin page now uses a searchable location field powered by the Open-Meteo Geocoding API.

Start typing a city or ZIP code and select a result. The application stores the returned:

- Display label
- Latitude
- Longitude
- Time zone

Latitude, longitude, and time zone are no longer shown as editable fields. They remain stored internally in `config.json` for NWS weather, sunrise, sunset, and clock calculations.


## Location search fallback

Location search now uses two sources:

1. `locations.json` for immediate saved-location matches
2. Open-Meteo geocoding for broader online search

If the online service is unavailable, saved locations still work. Kalispell and several nearby Montana communities are included by default. Add additional locations to `locations.json` using the same fields.
