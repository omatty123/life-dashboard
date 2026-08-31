import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildCandidates,
  collectBoardSignals,
  parseBoardProjects,
} from "./watch-projects.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const boardProjects = parseBoardProjects(
  fs.readFileSync(path.join(repoRoot, "index.html"), "utf8"),
);

test("parses the current board project registry", () => {
  assert.equal(boardProjects.length, 41);
  const signals = collectBoardSignals(boardProjects);
  assert(signals.repos.has("omatty123/lin-desk"));
  assert(signals.ids.has("no-time-left"));
  assert(signals.ids.has("teaching-fall-2026"));
  assert(signals.ids.has("cabin-dashboard"));
  assert(signals.ids.has("dunes-translator"));
  assert(signals.ids.has("korea-2026"));
  assert(signals.ids.has("paris-2026"));
});

test("reports a genuinely new repository but not an existing card", () => {
  const candidates = buildCandidates({
    boardProjects,
    githubOwner: "omatty123",
    baselineAt: "2026-06-20T19:44:17Z",
    ignoredCandidateIds: [],
    githubRepos: [
      {
        name: "lin-desk",
        nameWithOwner: "omatty123/lin-desk",
        url: "https://github.com/omatty123/lin-desk",
        homepageUrl: "https://omatty123.github.io/lin-desk/",
        isPrivate: false,
        isArchived: false,
        createdAt: "2026-06-21T00:00:00Z",
        pushedAt: "2026-06-21T00:00:00Z",
      },
      {
        name: "fresh-project",
        nameWithOwner: "omatty123/fresh-project",
        url: "https://github.com/omatty123/fresh-project",
        homepageUrl: "https://omatty123.github.io/fresh-project/",
        isPrivate: false,
        isArchived: false,
        createdAt: "2026-07-01T00:00:00Z",
        pushedAt: "2026-07-02T00:00:00Z",
      },
    ],
    codexProjects: [],
  });
  assert.deepEqual(candidates.map((candidate) => candidate.id), [
    "github:omatty123/fresh-project",
  ]);
});

test("keeps private candidate URLs out of the report", () => {
  const [candidate] = buildCandidates({
    boardProjects,
    githubOwner: "omatty123",
    baselineAt: "2026-06-20T19:44:17Z",
    ignoredCandidateIds: [],
    githubRepos: [
      {
        name: "private-project",
        nameWithOwner: "omatty123/private-project",
        url: "https://github.com/omatty123/private-project",
        homepageUrl: "",
        isPrivate: true,
        isArchived: false,
        createdAt: "2026-07-01T00:00:00Z",
        pushedAt: "2026-07-02T00:00:00Z",
      },
    ],
    codexProjects: [],
  });
  assert.equal(candidate.visibility, "private");
  assert.equal(candidate.url, null);
});
