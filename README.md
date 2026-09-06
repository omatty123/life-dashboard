# Life Dashboard

A compact garden-themed project launcher on GitHub Pages. `index.html` owns the project registry, `dashboard.js` owns filtering, ordering and browser-local private links, and `styles.css` owns presentation.

## Organization

Current Fall teaching comes first, followed by translation, home and family, travel, books/music/creative work, everyday tools, other teaching, and the local workspace. Groups have a stable reading order at every width. The navigation filters groups without rearranging their contents; search combines with the selected group. All 41 existing projects are retained.

Drag within a group, or focus a project row and press Alt + Up/Down, to save an order in the current browser. Existing `life-dashboard-order` preferences remain supported.

## Private destinations

The public registry contains only placeholders for unpublished private destinations. Open **Private links**, choose the personal JSON file, then use the connected Open buttons. The file is read locally with the File API, never uploaded. Import once in each browser; links are stored under `life-dashboard-private-links-v1`. This is browser-local convenience storage, not a credential vault or an access-control system. Destination sites still enforce their own authentication. **Forget private links in this browser** removes the imported destinations.

A private import has `version: 1` and a `links` object mapping known private project IDs to arrays of `{label, url}`. Only HTTPS URLs without embedded credentials are accepted. Imports merge with existing connections. Do not commit the user's import file, private URLs, or credentials. `.watcher/` is ignored and reserved for private local artifacts and watcher runtime state.

The old public HIST 213 and Teaching Today links returned 404 on September 6, 2026. Their replacement instructor destinations belong in the private import. META is a local Codex workspace rather than a hosted site; its row explains how to open it.

## Checks and publishing

Run `node --test scripts/*.test.mjs` and `node scripts/watch-projects.mjs audit`. Preview with a loopback-bound static server and check desktop/mobile layout, search, category filters, private import and saved order. GitHub Pages publishes the root of `main`; publish only the validated dashboard files. Keep private artifacts out of commits and deployment outputs.
