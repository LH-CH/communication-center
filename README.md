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


## Manual location fallback

If online search is unavailable and the location is not in `locations.json`, press **Set manually**.

Enter:

- Location name
- Latitude
- Longitude
- Time zone

The values are validated and then stored in the normal `config.json` location record. Latitude and longitude remain hidden after the location is selected.


## Admin polish

- Removed the Restore notices button
- Improved spacing between the selected location and YouTube URL
- Increased padding within the selected location card
- Added a short YouTube URL helper line
- Tightened the Display settings vertical rhythm


## Notice manager toggle

The admin page includes an **Enable notice manager** setting.

When disabled:

- The notice section is hidden on the public display
- The footer automatically changes to a two-column layout
- Existing notices remain stored in `config.json`
- The notice editor is hidden in the admin page
- Re-enabling the setting restores the existing notice queue

Configuration key:

```json
"showNoticeManager": true
```


## Footer layout update

The footer order is now:

1. Current weather
2. Active weather alerts
3. Department notices

Supporting weather text is larger for TV readability while temperature and the main weather icon keep their current size.

If the notice manager is disabled, the notice column disappears and the remaining weather and alert sections expand automatically.


## Department notice popup banner

Department notices no longer occupy a permanent section in the bottom information bar.

The bottom bar is always:

1. Current weather
2. Active weather alerts

When a department notice becomes active:

- A separate banner appears directly above the bottom bar
- The banner fades/slides into view
- Multiple notices remain vertically stacked and rotate automatically
- Adjacent notices fade toward the top and bottom
- Notice expiration remains subtly visible
- The banner disappears automatically when no notices are active
- Disabling Notice Manager prevents the banner from appearing


## Bottom bar readability refinement

- Current weather remains on the left
- Active weather alerts are anchored to the far right
- Temperature and primary weather icon retain their existing size
- Condition, wind, humidity, sunrise, sunset, and supporting weather text are moderately larger for across-the-room readability
- Department notices remain a separate popup banner above the bottom bar


## Refresh interval

The full display page now automatically refreshes every 10 minutes.


## Weather ribbon refinement
- Weather information is grouped more tightly instead of spreading across the entire footer.
- Wind, humidity, sunrise, and sunset labels/values are larger for TV viewing.
- Temperature and main icon remain the dominant elements.
- Weather alerts remain isolated at the far right with a subtle divider.
- Full-page refresh remains 10 minutes.


## Weather footer spacing update

- Added left-side breathing room around the current weather icon and temperature
- Centered Wind, Humidity, Sunrise, and Sunset as a balanced 2×2 group
- Increased secondary weather labels and values by approximately 25%+
- Kept the main temperature and weather icon at their existing size
- Weather alerts remain aligned at the far right


## Balanced footer spacing
- Rebalanced the footer into a two-thirds weather area and one-third alert area.
- Current conditions and the four weather statistics now use more even internal spacing.
- The 2x2 stat block is centered in its available area.
- Weather alerts are centered within the far-right section.
- Left/right padding is more symmetrical across the footer.
