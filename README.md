# Life Dashboard

A compact garden-themed project launcher on GitHub Pages. `index.html` owns the project registry, `dashboard.js` owns filtering, ordering and browser-local private links, and `styles.css` owns presentation.

## Layout

The original six categories and flowing, balanced columns are restored. Preserve the compact rows, white title, small link labels, and sky-and-grass identity. The user explicitly prefers smooth continuity over stricter categorization. Do not add a category toolbar, separate aligned grid rows, or more category boxes.

Search covers the whole board. Drag within a category, or focus a row and press Alt + Up/Down, to save an order in the current browser. Existing preferences remain supported.

## Private destinations

The public registry contains only placeholders for unpublished private destinations. Open **Private links** below the board, choose the personal JSON file, then use the connected Open buttons. The file is read locally with the File API, never uploaded. Import once in each browser; links are stored under `life-dashboard-private-links-v1`. This is browser-local convenience storage, not a credential vault or an access-control system. Destination sites still enforce their own authentication. **Forget private links in this browser** removes the imported destinations.

A private import has `version: 1` and a `links` object mapping known private project IDs to arrays of `{label, url}`. Only HTTPS URLs without embedded credentials are accepted. Imports merge with existing connections. Do not commit the user's import file, private URLs, or credentials. `.watcher/` is ignored and reserved for private local artifacts and watcher runtime state.

The old public HIST 213 and Teaching Today links returned 404 on September 6, 2026. Their replacement instructor destinations belong in the private import. META remains a local Codex workspace rather than a hosted site.

## Checks and publishing

Run `node --test scripts/*.test.mjs` and `node scripts/watch-projects.mjs audit`. Preview with a loopback-bound static server and check desktop/mobile layout, search, private import and saved order. GitHub Pages publishes the root of `main`; publish only the validated dashboard files. Keep private artifacts out of commits and deployment outputs.
