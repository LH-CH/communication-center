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
