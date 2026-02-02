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
