#!/usr/bin/env node
/**
 * publish-next-piii
 *
 * Automates the manual "Release checklist (fork)" steps in FORK-CHANGES.md.
 *
 * It:
 * - Looks up published versions for @yolziii/piii-coding-agent
 * - Computes the next <upstream>-piii.<n> for the local upstream base version
 * - Runs the exact manual steps (check -> bump -> sync -> install -> check -> commit/tag/push -> publish)
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const REGISTRY_PACKAGE = "@yolziii/piii-coding-agent";

// Must match the manual checklist (avoid bumping example workspaces).
const PUBLISHED_WORKSPACES = [
	"packages/ai",
	"packages/agent",
	"packages/tui",
	"packages/coding-agent",
	"packages/mom",
	"packages/web-ui",
	"packages/pods",
];

function run(cmd, { silent = false } = {}) {
	console.log(`$ ${cmd}`);
	return execSync(cmd, {
		encoding: "utf-8",
		stdio: silent ? ["ignore", "pipe", "pipe"] : "inherit",
	});
}

function readStdout(cmd) {
	return execSync(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function getRepoStatus() {
	return readStdout("git status --porcelain");
}


function getLocalBaseVersion() {
	const pkg = JSON.parse(readFileSync("packages/ai/package.json", "utf-8"));
	const v = String(pkg.version);
	const m = v.match(/^(\d+\.\d+\.\d+)/);
	if (!m) {
		throw new Error(`Unsupported local version format in packages/ai: ${v}`);
	}
	return m[1];
}

function escapeRegExp(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getNextForkVersion(baseVersion) {
	let versionsRaw;
	try {
		versionsRaw = JSON.parse(readStdout(`npm view ${REGISTRY_PACKAGE} versions --json`));
	} catch {
		// If the package is not published yet or registry is unavailable, treat as empty.
		versionsRaw = [];
	}

	const versions = Array.isArray(versionsRaw) ? versionsRaw : [versionsRaw];
	const re = new RegExp(`^${escapeRegExp(baseVersion)}-piii\\.(\\d+)$`);

	let maxN = 0;
	for (const v of versions) {
		const m = String(v).match(re);
		if (!m) continue;
		const n = Number.parseInt(m[1], 10);
		if (Number.isFinite(n) && n > maxN) maxN = n;
	}

	return `${baseVersion}-piii.${maxN + 1}`;
}

console.log("\n=== publish-next-piii ===\n");

// Step 1: Ensure working tree is clean
const status = getRepoStatus();
if (status) {
	console.error("Error: Uncommitted changes detected. Commit or stash first.");
	console.error(status);
	process.exit(1);
}

// Step 2: Run checks before changing versions
run("npm run check");

// Step 3: Decide the next fork version number
// (We still run the command from the checklist so you can see what exists.)
run(`npm view ${REGISTRY_PACKAGE} versions`);
const baseVersion = getLocalBaseVersion();
const nextVersion = getNextForkVersion(baseVersion);
console.log(`\nLocal base version: ${baseVersion}`);
console.log(`Next fork version:  ${nextVersion}\n`);

// Step 4: Set lockstep version for published packages (avoid examples)
const workspaceArgs = PUBLISHED_WORKSPACES.map((w) => `-w ${w}`).join(" ");
run(`npm version ${nextVersion} --no-git-tag-version ${workspaceArgs}`);

// Step 5: Sync internal workspace dependency ranges
run("node scripts/sync-versions.js");

// Step 6: Reinstall to update lockfile
run("npm install");

// Step 7: Run checks again
run("npm run check");

// Step 8: Commit/tag/push and publish
run("git add .");
run(`git commit -m "Release v${nextVersion}"`);
run(`git tag v${nextVersion}`);
run("git push origin main");
run(`git push origin v${nextVersion}`);
run("npm run publish");
