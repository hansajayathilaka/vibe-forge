# VibeForge — Claude Code Context

> This file is the primary context source for Claude Code working in this repository.
> Keep it up to date as the architecture evolves.

## What this project is

A low-code platform where the entire frontend UI is driven by **UI Definition JSON** files and **JS Behaviour Files** fetched at runtime. The backend is **PocketBase** (single binary, embedded SQLite, auto REST API).

There is no hard-coded UI. Claude Code is the vibe coding IDE in Phase 1.

## Essential reading (read these before generating anything)

- [`docs/IDEA.md`](./docs/IDEA.md) — full vision, architecture, and design decisions
- [`docs/PHASE1.md`](./docs/PHASE1.md) — Phase 1 scope, JSON UI engine spec, component catalog, and screen file format

## Key architectural rules

1. **UI JSON files live in `app/screens/`** — one file per screen, served by PocketBase via `--publicDir`.
2. **Behaviour files live in `app/behaviours/`** — plain ES modules, loaded via dynamic `import()`.
3. **PocketBase hooks live in `app/hooks/`** — copied to `backend/pb_hooks/` by `scripts/setup.sh`.
4. **The frontend never hard-codes UI** — all structure comes from the JSON spec at runtime.
5. **One origin** — `VITE_PB_URL` is the only env var the frontend needs; it points to PocketBase which serves both the data API and the static app files.

## JSON UI engine

Uses `@json-render/core` + `@json-render/react` (Vercel Labs). See `docs/PHASE1.md` for the full screen file format, element spec, data binding expressions, DataCall schema, and component catalog.

## Slash commands (available after TASK-10)

| Command | Purpose |
|---|---|
| `/gen-screen` | Generate a new UI Definition JSON screen |
| `/gen-behaviour` | Generate a JS Behaviour File |
| `/gen-schema` | Generate a PocketBase migration file |
| `/gen-workflow` | Generate a PocketBase hook script |

## Current phase

**Phase 1 — Scaffolding & Runtime Foundation** (`🟡 Designing`)

Task index: [`docs/PHASE1.md#tasks`](./docs/PHASE1.md#tasks)
