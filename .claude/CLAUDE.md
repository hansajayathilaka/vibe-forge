# VibeForge — Platform Developer Context

VibeForge is a low-code platform template. This repository is the platform itself — when Phase 1 is complete it becomes a GitHub template that "vibe coders" fork to build their own data-driven applications using Claude Code as the IDE.

## You are building the platform

You are NOT a vibe coder building an app on top of VibeForge. You are building the platform infrastructure. The deliverables are defined as 12 tasks in `docs/tasks/PROGRESS.md`.

**To build Phase 1:** run `/next-task` in Claude Code. It picks up the next unblocked task, reads the spec, implements all deliverables, updates the progress tracker, and commits.

## Repo Layer Separation (critical)

| Directory | What it is | Who edits it |
|-----------|-----------|--------------|
| `app/` | The vibe coder's application files (screens, behaviours, hooks) | Vibe coders (future template users) |
| `frontend/` | The platform runtime — React + json-render renderer | Platform devs (you, now) |
| `backend/` | PocketBase binary, Go migrations, JS hooks | Both |
| `.claude/` | Claude Code context, slash commands, and prompt skill files | Platform devs (you, now) |
| `shared/` | TypeScript types and JSON schemas shared across layers | Platform devs |
| `scripts/` | Setup and code-generation scripts | Platform devs |
| `docs/` | Architecture, task specs, and this progress tracker | Platform devs |

`frontend/` and `app/` must stay cleanly separated. The runtime fetches screens and behaviours from PocketBase's static file serving (`--publicDir ../app`) — the frontend never imports from `app/` directly.

## Current State

Phase 1 — Scaffolding & Runtime Foundation: **all tasks pending**.

See `docs/tasks/PROGRESS.md` for the full task list and dependency graph.
See `docs/PHASE1.md` for the complete technical specification.
See `docs/IDEA.md` for the full platform vision and architecture.

## Phase 1 Architecture in Brief

```
pnpm dev
  ├── Vite dev server  → http://localhost:5173  (React frontend)
  └── PocketBase       → http://localhost:8090
        ├── /api/collections/*   (REST data API)
        └── /screens/*.json      (UI Definition JSON, static)
        └── /behaviours/*.js     (JS Behaviour files, static)
```

The frontend reads `VITE_PB_URL` (default: `http://localhost:8090`) and fetches everything from that single origin — config files and data API alike.

## Skill Reference Files

These files in `.claude/prompts/` are used by the `/next-task` command and by generation commands added in TASK-10:

- `ui-json-spec.md` — Screen JSON format, DataCall spec, json-render state binding expressions, full annotated example
- `pocketbase-patterns.md` — Go migration structure, field types, API rules, JS hook patterns
- `behaviour-file-spec.md` — Behaviour file ES module contract, BehaviourContext interface, wiring in screen specs

## Key Design Decisions

1. **PocketBase as static file server** — `--publicDir ../app` makes `app/` accessible over HTTP. When Phase 2 adds DB-backed config, PocketBase custom routes intercept `/screens/*` and `/behaviours/*` transparently — frontend code doesn't change.

2. **json-render for rendering** — `@json-render/core` + `@json-render/react` (Vercel Labs) handles the renderer, state store, data binding, repeat, visibility, and `catalog.prompt()` generation. We build components and wire actions; the library does the rest.

3. **One env var** — `VITE_PB_URL` is the only runtime configuration the frontend needs.

4. **Behaviour files are plain ES modules** — loaded via dynamic `import()` from PocketBase. No sandbox in Phase 1 (explicit non-goal). Sandboxing is deferred to Phase 2.
