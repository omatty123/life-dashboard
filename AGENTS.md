# Life Dashboard

## Mission

Maintain the public Life Dashboard as Matty's fast project launcher and the
private watcher that notices projects which may need a card.

## Sources of truth

- `index.html` owns the public cards and links.
- `watch-config.json` owns watcher discovery settings and explicit exclusions.
- GitHub and Codex use separate discovery baselines because Codex imported
  several older saved projects in one migration batch.
- `scripts/watch-projects.mjs` compares the public board with GitHub and Codex's
  saved local projects.
- `.watcher/state.json` is private local runtime state and must never be
  committed or published.

## Privacy and authority

- Discovery does not authorize publication.
- Never put a private repository URL, local filesystem path, student data,
  copyrighted source material, medical information, or private project detail
  on the public dashboard.
- A watcher may report a candidate to Matty. Add a public card only after Matty
  approves that project and its public-safe links.
- Never infer that a GitHub repository, Codex project, Vercel deployment, or
  ChatGPT Site is public-safe merely because it exists.

## Working method

1. Run `node scripts/watch-projects.mjs audit` to inspect candidates.
2. Classify candidates as likely public additions, private/internal work, or
   uncertain.
3. Ask Matty before adding or excluding a project.
4. After an alert is delivered, acknowledge its candidate IDs with
   `node scripts/watch-projects.mjs acknowledge <id>...` so it is not repeated.
5. Validate with `node --test scripts/watch-projects.test.mjs`.

## Public changes

Preserve the dashboard's compact launcher design and browser-local drag order.
Keep its cute, cartoony identity: bright blue sky, green grass, white panels,
puffy clouds, and a sunny yellow sun. Layout improvements should retain that palette.
Test links and layout before publishing. Do not deploy or push unrelated work.

## Confirmed layout preference (September 6, 2026)

Matty rejected the stricter eight-category redesign and its aligned grid rows.
Prefer the original smooth, balanced columns and compact link rows, even when
that means looser categories. Do not add navigation clutter or split the board
into more disconnected boxes. Keep private-link setup unobtrusive below the board.
