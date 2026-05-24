# VibeForge — Platform Developer Context

VibeForge is a low-code platform template. This repository is the platform itself. When Phase 1 is complete it becomes a GitHub template that "vibe coders" fork to build their own data-driven applications using Claude Code as the IDE.

## You are building the platform

You are NOT a vibe coder building an app on top of VibeForge. You are building the platform infrastructure. The deliverables are 12 tasks tracked in `docs/tasks/PROGRESS.md`.

**To build Phase 1:** run `/next-task`. It picks up the next unblocked task, reads the spec, implements all deliverables, updates the progress tracker, and commits.

## Current state

See `docs/tasks/PROGRESS.md` for live status. As of the last update: TASK-01 through TASK-10 are done; TASK-11 (Example Application) and TASK-12 (Template Finalisation) are pending.

Essential reading before changing anything:
- `docs/IDEA.md` — full platform vision and architecture decisions
- `docs/PHASE1.md` — complete technical spec, component catalog, DataCall format
- `docs/tasks/PROGRESS.md` — task status and dependency graph

## Repo layer separation (critical)

| Directory | What it is | Who edits it |
|-----------|-----------|--------------|
| `app/` | Vibe coder's application files (screens, behaviours, hooks) | Vibe coders (template users) |
| `frontend/` | Platform runtime — React + json-render renderer | Platform devs |
| `backend/` | PocketBase binary, Go migrations, JS hooks | Platform devs + vibe coders |
| `app/.claude/` | Vibe coder's Claude Code commands and prompts | Platform devs |
| `.claude/` | Platform dev Claude Code commands and prompts | Platform devs |
| `shared/` | TypeScript types and JSON schemas shared across layers | Platform devs |
| `scripts/` | Setup and code-generation scripts | Platform devs |
| `docs/` | Architecture, task specs, and progress tracker | Platform devs |

`frontend/` and `app/` must stay cleanly separated. The runtime fetches screens and behaviours from PocketBase static file serving (`--publicDir ../app`) — the frontend never imports from `app/` directly.

## Architecture

```
pnpm dev
  ├── Vite dev server  → http://localhost:5173  (React frontend)
  └── PocketBase       → http://localhost:8090
        ├── /api/collections/*   (REST data API)
        ├── /screens/*.json      (UI Definition JSON, served from app/)
        └── /behaviours/*.js     (JS Behaviour files, served from app/)
```

`VITE_PB_URL` (default `http://localhost:8090`) is the only environment variable the frontend needs.

## Prompt skill files

These files are read by `/next-task` when implementing tasks:

| File | Used when the task involves |
|------|-----------------------------|
| `.claude/prompts/ui-json-spec.md` | Screen JSON, renderer, json-render, UI components |
| `.claude/prompts/pocketbase-patterns.md` | PocketBase migrations or JS hooks |
| `.claude/prompts/behaviour-file-spec.md` | Behaviour files |

The same spec files are also copied to `app/.claude/prompts/` for vibe coder use.

## Key design decisions

1. **PocketBase as static file server** — `--publicDir ../app` makes `app/` accessible over HTTP. When Phase 2 adds DB-backed config, PocketBase custom routes intercept `/screens/*` and `/behaviours/*` transparently — frontend code doesn't change.

2. **json-render for rendering** — `@json-render/core` + `@json-render/react` handles the renderer, state store, data binding, repeat, visibility, and component registration. We build components and wire actions; the library does the rest.

3. **One env var** — `VITE_PB_URL` is the only runtime configuration the frontend needs.

4. **Behaviour files are plain ES modules** — loaded via dynamic `import()` from PocketBase. No sandbox in Phase 1 (explicit non-goal). Sandboxing is deferred to Phase 2.

5. **Vibe coder works in `app/`** — Claude Code is opened from within `app/`. All vibe coder commands, prompts, and context live in `app/.claude/`. The `app/` directory is what gets customised when someone forks the template.
