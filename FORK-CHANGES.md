# Fork changes applied in this repo (piii)

This file documents what was actually changed during the initial rebrand session.

## Upstream

- Upstream: https://github.com/badlogic/pi-mono

## Package IDs (npm)

Workspace packages were renamed from `@mariozechner/*` to `@yolziii/piii-*`:

- `packages/ai` -> `@yolziii/piii-ai`
- `packages/agent` -> `@yolziii/piii-agent-core`
- `packages/tui` -> `@yolziii/piii-tui`
- `packages/coding-agent` -> `@yolziii/piii-coding-agent`
- `packages/mom` -> `@yolziii/piii-mom`
- `packages/web-ui` -> `@yolziii/piii-web-ui`
- `packages/pods` -> `@yolziii/piii-pods`

Internal workspace dependencies were updated accordingly.

## CLI / config rebrand

`packages/coding-agent/package.json`:

- `piConfig.name`: `pi` -> `piii`
- `piConfig.configDir`: `.pi` -> `.piii`
- `bin`: `pi` -> `piii`

## npm publishing policy (fork)

- Versioning: base version matches upstream (`MAJOR.MINOR.PATCH`). If there are multiple fork builds for the same upstream version, publish them as pre-releases: `<upstream>-piii.<n>` (example: `0.51.0-piii.1`, `0.51.0-piii.2`).
- Publish (monorepo): `npm publish -ws --tag piii --access public`
- Install: `npm i -g @yolziii/piii-coding-agent@piii`

### Monorepo publish scripts

To enforce the fork publishing policy, the root `package.json` scripts were adjusted:

- `npm run publish` uses: `npm publish -ws --tag piii --access public`
- `npm run publish:dry` uses: `npm publish -ws --tag piii --access public --dry-run`

### Release checklist (fork)

Manual flow for publishing a new fork build for an existing upstream base version:

1. Ensure working tree is clean and you’re on the branch you publish from (typically `main`).
2. (Recommended) Run checks on the current commit (before changing versions):
   - `npm run check`
3. Decide the next fork version number (`<upstream>-piii.<n>`):
   - `npm view @yolziii/piii-coding-agent versions`
4. Set the lockstep version for published packages (avoid bumping example workspaces):
   - `npm version <upstream>-piii.<n> --no-git-tag-version -w packages/ai -w packages/agent -w packages/tui -w packages/coding-agent -w packages/mom -w packages/web-ui -w packages/pods`
5. Sync internal workspace dependency ranges (lockstep):
   - `node scripts/sync-versions.js`
6. Reinstall to update lockfile:
   - `npm install`
7. Run checks again (recommended, since the install/lockfile changed):
   - `npm run check`
8. Commit/tag/push and publish:
   - `git add package.json package-lock.json packages`
   - `git commit -m "Release v<upstream>-piii.<n>"`
   - `git tag v<upstream>-piii.<n>`
   - `git push origin main`
   - `git push origin v<upstream>-piii.<n>`
   - `npm run publish`

## Source imports

All TypeScript imports of the form `@mariozechner/pi-*` were updated to the forked package IDs `@yolziii/piii-*` across the repository (excluding `dist/` and `node_modules/`).

## Root package metadata

- Root `package.json` name was updated so `npm run ...` output no longer shows `pi-monorepo@...`.

## Fork notices

- Root `README.md` contains a fork notice.
- Each package README contains a fork notice indicating the package is part of the fork (for npmjs.com display).
- `CONTRIBUTING.md` was replaced with a short notice directing contributions upstream.

## Misc

- Project-local `.pi/extensions/*.ts` imports were updated to the forked package IDs.
- Test fixture `packages/coding-agent/test/fixtures/before-compaction.jsonl` was updated to not contain `@mariozechner/pi-*` identifiers.
