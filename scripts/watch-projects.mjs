#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const defaultConfigPath = path.join(repoRoot, "watch-config.json");
const defaultStatePath = path.join(repoRoot, ".watcher", "state.json");

function normalizeText(value = "") {
  return String(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeUrl(value = "") {
  if (!value) return "";
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return String(value).replace(/\/+$/, "").toLowerCase();
  }
}

function githubRepoKey(value = "") {
  if (!value) return "";
  const normalized = String(value)
    .replace(/^git@github\.com:/i, "https://github.com/")
    .replace(/\.git$/i, "");
  try {
    const url = new URL(normalized);
    if (url.hostname.toLowerCase() === "github.com") {
      const [owner, repo] = url.pathname.split("/").filter(Boolean);
      return owner && repo ? `${owner}/${repo}`.toLowerCase() : "";
    }
    if (url.hostname.toLowerCase().endsWith(".github.io")) {
      const owner = url.hostname.split(".")[0];
      const [repo] = url.pathname.split("/").filter(Boolean);
      return owner && repo ? `${owner}/${repo}`.toLowerCase() : "";
    }
  } catch {
    return "";
  }
  return "";
}

function expandHome(value) {
  if (value === "~") return os.homedir();
  if (value?.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value;
}

export function parseBoardProjects(html) {
  const match = html.match(/const projects = (\[[\s\S]*?\n\s*\]);/);
  if (!match) throw new Error("Could not find the projects array in index.html");
  const projects = vm.runInNewContext(`(${match[1]})`, Object.create(null), {
    timeout: 1000,
  });
  if (!Array.isArray(projects)) throw new Error("The board projects value is not an array");
  return JSON.parse(JSON.stringify(projects));
}

export function collectBoardSignals(projects) {
  const ids = new Set();
  const names = new Set();
  const urls = new Set();
  const repos = new Set();

  for (const project of projects) {
    ids.add(normalizeText(project.id));
    names.add(normalizeText(project.name));
    names.add(normalizeText([project.name, project.subtitle].filter(Boolean).join(" ")));
    for (const link of project.links ?? []) {
      const normalizedUrl = normalizeUrl(link.url);
      if (normalizedUrl) urls.add(normalizedUrl);
      const repo = githubRepoKey(link.url);
      if (repo) repos.add(repo);
    }
  }
  return { ids, names, urls, repos };
}

function isBoardMatch(item, signals) {
  const repo = githubRepoKey(item.url ?? item.remoteUrl ?? "");
  if (repo && signals.repos.has(repo)) return true;
  if (item.homepageUrl && signals.urls.has(normalizeUrl(item.homepageUrl))) return true;
  const normalizedName = normalizeText(item.name ?? item.label ?? "");
  return signals.ids.has(normalizedName) || signals.names.has(normalizedName);
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function getGitHubRepos(owner) {
  const fields = [
    "name",
    "nameWithOwner",
    "url",
    "homepageUrl",
    "isPrivate",
    "isArchived",
    "createdAt",
    "pushedAt",
    "description",
  ].join(",");
  const output = execFileSync(
    "gh",
    ["repo", "list", owner, "--limit", "200", "--json", fields],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return JSON.parse(output);
}

function getOriginRemote(projectPath) {
  if (!projectPath || !fs.existsSync(path.join(projectPath, ".git"))) return "";
  try {
    return execFileSync("git", ["-C", projectPath, "remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function getCodexProjects(statePath, ignoredLabels) {
  const state = readJson(statePath, {});
  const localProjects =
    state?.["local-projects"] ??
    state?.["electron-persisted-atom-state"]?.["local-projects"] ??
    {};
  return Object.values(localProjects)
    .filter((project) => !ignoredLabels.has(project.name))
    .map((project) => {
      const projectPath = project.rootPaths?.[0] ?? "";
      return {
        projectId: project.id,
        label: project.name,
        createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : null,
        remoteUrl: getOriginRemote(projectPath),
      };
    });
}

function sourceIsAfterBaseline(createdAt, baselineAt) {
  if (!createdAt) return false;
  return Date.parse(createdAt) >= Date.parse(baselineAt);
}

export function buildCandidates({
  boardProjects,
  githubRepos,
  codexProjects,
  githubOwner,
  baselineAt,
  codexBaselineAt = baselineAt,
  ignoredCandidateIds = [],
}) {
  const signals = collectBoardSignals(boardProjects);
  const ignored = new Set(ignoredCandidateIds.map((id) => id.toLowerCase()));
  const byId = new Map();

  for (const repo of githubRepos) {
    const repoKey = (repo.nameWithOwner || `${githubOwner}/${repo.name}`).toLowerCase();
    const id = `github:${repoKey}`;
    if (ignored.has(id) || isBoardMatch(repo, signals)) continue;
    if (!sourceIsAfterBaseline(repo.createdAt, baselineAt)) continue;
    byId.set(id, {
      id,
      name: repo.name,
      source: "github",
      visibility: repo.isPrivate ? "private" : "public",
      createdAt: repo.createdAt,
      updatedAt: repo.pushedAt,
      url: repo.isPrivate ? null : repo.url,
      homepageUrl: repo.isPrivate ? null : repo.homepageUrl || null,
      description: repo.description || null,
      archived: Boolean(repo.isArchived),
      codexProject: null,
    });
  }

  for (const project of codexProjects) {
    if (isBoardMatch(project, signals)) continue;
    if (!sourceIsAfterBaseline(project.createdAt, codexBaselineAt)) continue;
    const remoteKey = githubRepoKey(project.remoteUrl);
    const githubId = remoteKey ? `github:${remoteKey}` : "";
    if (githubId && byId.has(githubId)) {
      byId.get(githubId).codexProject = project.label;
      continue;
    }
    const id = `codex:${project.projectId}`.toLowerCase();
    if (ignored.has(id)) continue;
    byId.set(id, {
      id,
      name: project.label,
      source: "codex",
      visibility: "local-only",
      createdAt: project.createdAt,
      updatedAt: null,
      url: null,
      homepageUrl: null,
      description: null,
      archived: false,
      codexProject: project.label,
    });
  }

  return [...byId.values()].sort((a, b) =>
    String(a.createdAt).localeCompare(String(b.createdAt)),
  );
}

function loadConfig(configPath = defaultConfigPath) {
  const config = readJson(configPath);
  if (!config) throw new Error(`Missing watcher config: ${configPath}`);
  return config;
}

function loadRuntime(configPath = defaultConfigPath, statePath = defaultStatePath) {
  const config = loadConfig(configPath);
  const boardHtml = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const boardProjects = parseBoardProjects(boardHtml);
  const githubRepos = getGitHubRepos(config.githubOwner);
  const codexProjects = getCodexProjects(
    expandHome(config.codexStatePath),
    new Set(config.ignoredCodexProjectLabels ?? []),
  );
  const allCandidates = buildCandidates({
    boardProjects,
    githubRepos,
    codexProjects,
    githubOwner: config.githubOwner,
    baselineAt: config.baselineAt,
    codexBaselineAt: config.codexBaselineAt ?? config.baselineAt,
    ignoredCandidateIds: config.ignoredCandidateIds,
  });
  const state = readJson(statePath, { version: 1, acknowledged: {} });
  const newCandidates = allCandidates.filter((candidate) => !state.acknowledged?.[candidate.id]);
  return {
    config,
    state,
    statePath,
    report: {
      generatedAt: new Date().toISOString(),
      baselineAt: config.baselineAt,
      codexBaselineAt: config.codexBaselineAt ?? config.baselineAt,
      boardProjectCount: boardProjects.length,
      sourceCounts: {
        githubRepositories: githubRepos.length,
        codexLocalProjects: codexProjects.length,
      },
      newCandidates,
      acknowledgedCandidateCount: allCandidates.length - newCandidates.length,
    },
  };
}

function printHumanReport(report) {
  console.log(`Life Board watcher · ${report.generatedAt}`);
  console.log(`Board cards: ${report.boardProjectCount}`);
  console.log(
    `Sources: ${report.sourceCounts.githubRepositories} GitHub repositories · ` +
      `${report.sourceCounts.codexLocalProjects} Codex local projects`,
  );
  if (!report.newCandidates.length) {
    console.log("No new unacknowledged project candidates.");
    return;
  }
  console.log(`New candidates: ${report.newCandidates.length}`);
  for (const candidate of report.newCandidates) {
    const details = [candidate.source, candidate.visibility, candidate.createdAt]
      .filter(Boolean)
      .join(" · ");
    console.log(`- ${candidate.name} [${candidate.id}] (${details})`);
  }
}

function acknowledge(statePath, state, ids) {
  if (!ids.length) throw new Error("Provide at least one candidate ID to acknowledge");
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const acknowledged = { ...(state.acknowledged ?? {}) };
  const now = new Date().toISOString();
  for (const id of ids) acknowledged[id.toLowerCase()] = now;
  fs.writeFileSync(
    statePath,
    `${JSON.stringify({ version: 1, acknowledged }, null, 2)}\n`,
    "utf8",
  );
}

function main() {
  const [command = "audit", ...args] = process.argv.slice(2);
  const runtime = loadRuntime();
  if (command === "audit") {
    if (args.includes("--json")) console.log(JSON.stringify(runtime.report, null, 2));
    else printHumanReport(runtime.report);
    return;
  }
  if (command === "acknowledge") {
    acknowledge(runtime.statePath, runtime.state, args);
    console.log(`Acknowledged ${args.length} candidate${args.length === 1 ? "" : "s"}.`);
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(`Life Board watcher failed: ${error.message}`);
    process.exitCode = 1;
  }
}
