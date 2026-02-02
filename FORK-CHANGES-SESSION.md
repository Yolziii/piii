# Forking pi-mono to piii (@yolziii)

This checklist describes the minimal and recommended changes to create a full monorepo fork of **pi-mono** that:

- publishes all packages under the **@yolziii** npm scope
- installs a CLI named **`piii`** (instead of `pi`)
- uses a config directory **`.piii`** (instead of `.pi`)
- can periodically sync with upstream `badlogic/pi-mono`

> Keep `LICENSE` (MIT) and preserve the original copyright + permission notice.

---

## 0) Decide naming conventions

Recommended consistent naming (examples):

- CLI command: `piii`
- Config dir: `.piii`
- Packages:
  - `@yolziii/piii-ai`
  - `@yolziii/piii-agent-core`
  - `@yolziii/piii-tui`
  - `@yolziii/piii-coding-agent`
  - `@yolziii/piii-mom`
  - `@yolziii/piii-pods`
  - `@yolziii/piii-web-ui`

Alternative: keep original package names but under your scope (e.g. `@yolziii/pi-ai`). This reduces rename churn but is easier to confuse with upstream docs. Pick one scheme and apply everywhere.

---

## 1) Git remotes for syncing upstream

Add upstream remote:

```bash
git remote add upstream https://github.com/badlogic/pi-mono.git
```

Sync workflow (rebase):

```bash
git fetch upstream
git checkout main
git pull --rebase upstream main
git push origin main
```

Or merge-based sync:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

Recommendation: do one big initial “rebrand/rename” commit, then keep changes small. It makes future conflict resolution easier.

---

## 2) CLI rebrand: `pi` -> `piii` and `.pi` -> `.piii`

File: `packages/coding-agent/package.json`

- Change package name to your scope/name.
- Change `bin` entry from `pi` to `piii`.
- Change `piConfig.name` to `piii`.
- Change `piConfig.configDir` to `.piii`.

Example:

```json
{
  "name": "@yolziii/piii-coding-agent",
  "piConfig": {
    "name": "piii",
    "configDir": ".piii"
  },
  "bin": {
    "piii": "dist/cli.js"
  }
}
```

Also update docs/examples that mention `pi` commands to `piii`.

---

## 3) Rename and rewire all workspace packages

For each `packages/*/package.json`:

### 3.1 Package name

Change `name` from `@mariozechner/...` to `@yolziii/...` using your chosen naming scheme.

### 3.2 Internal dependencies

Update all dependencies that reference upstream packages:

- `@mariozechner/pi-ai`
- `@mariozechner/pi-agent-core`
- `@mariozechner/pi-tui`
- `@mariozechner/pi-coding-agent`
- etc.

…to the forked equivalents under `@yolziii/...`.

### 3.3 Repository metadata

Update `repository.url` to your fork repo and keep `repository.directory` accurate.

---

## 4) Root workspace configuration

File: `package.json` (repo root)

- Consider renaming the repo package name from `pi-monorepo` to something like `piii-monorepo` (optional; it is `private: true` so it’s mainly cosmetic).
- Ensure `workspaces` are still correct.
- If root `dependencies` reference `@mariozechner/pi-coding-agent`, decide if you want it to reference your forked package instead (recommended for consistency).

---


Minimum places to search/replace:

- Command invocation: `pi` -> `piii` (but avoid changing unrelated words like “pi-mono” if you want to keep upstream attribution)
- Config directory: `.pi` -> `.piii`
- npm package name: `@mariozechner/pi-...` -> `@yolziii/...`
- GitHub links: `badlogic/pi-mono` -> your fork

Suggested grep queries:

- `@mariozechner/`
- `pi-coding-agent`
- ``\bpi\b`` (careful: short token, review changes)
- `.pi/` and `~/.pi/`
- `PI_CODING_AGENT_DIR` and other `PI_*` env var mentions

Files that almost certainly need edits:

- `README.md` (root)
- `packages/coding-agent/README.md`
- `packages/coding-agent/docs/*.md`
- possibly other package READMEs (ai/agent/tui)

---

## 5) Docs / branding updates

Add an explicit fork notice near the top of your main README(s):

- `README.md` (repo root)
- `packages/coding-agent/README.md` (CLI)

Suggested text (adapt as you like):

> This project is a fork of https://github.com/badlogic/pi-mono (Pi).
> The goal of this fork is to experiment with the architecture and learn Pi.
> I will try to keep it reasonably up to date with upstream when possible.

Also update docs/examples that mention `pi` commands to `piii`.

---

## 6) Startup logo / terminal title (π)

There is **no big ANSI-art logo block** baked in, but there *is* a hardcoded use of the **Greek letter π** in the terminal title.

File: `packages/coding-agent/src/modes/interactive/interactive-mode.ts`

Method: `updateTerminalTitle()` sets the title to:

- ``π - <session> - <cwd>``
- or ``π - <cwd>``

If you want full rebranding, change that to `piii` (or another string).

Also note: the startup header text uses `APP_NAME` from `packages/coding-agent/src/config.ts` (derived from `piConfig.name`). So once you change `piConfig.name` to `piii`, the visible header branding will follow.

---

## 7) Config/env var behavior

`packages/coding-agent/docs/development.md` says changing `piConfig.name` + `configDir` affects:

- CLI banner
- config paths
- environment variable names

So after rebranding, validate:

- where sessions are written
- what env vars are used for overriding the config directory

If any docs hardcode `PI_CODING_AGENT_DIR`, update them to your fork’s naming.

---

## 7) Publishing

- Make sure each package has `license: MIT` and that `LICENSE` exists at repo root.
- `files` arrays in each package should still include built output (`dist`) and required runtime assets.
- For scoped packages on npm, you likely want:

```bash
npm publish --access public
```

If you publish the entire workspace set:

```bash
npm publish -ws --access public
```

(only after verifying everything builds and resolves to your scope).

---

## 8) Recommended validation steps

From repo root:

```bash
npm install
npm run build
npm run check
```

Then validate the CLI locally (examples):

- `npm -w packages/coding-agent pack` then install the resulting `.tgz` globally for a local test.
- or `npm link` from `packages/coding-agent` and run `piii`.

---

## 9) Syncing upstream after rebrand

Expect conflicts primarily in:

- `packages/*/package.json` (names, deps)
- README/docs files

Workflow suggestion:

1. `git fetch upstream`
2. rebase/merge onto `upstream/main`
3. resolve conflicts by keeping your fork’s branding fields (`@yolziii`, `piii`, `.piii`) while accepting upstream code changes.

---

## Notes / non-goals

- This checklist does not remove upstream attribution.
- This checklist does not change runtime behavior beyond naming/config paths.
- If you want to avoid maintaining a fork, consider shipping extensions instead. But for a full rebrand/distribution, a fork is fine under MIT.
