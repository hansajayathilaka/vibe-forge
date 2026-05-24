# VibeForge

VibeForge is a **low-code platform template** for building data-driven web applications with Claude Code as your AI pair programmer. Fork this repo, run three commands, then describe your app to Claude Code — it generates screens, data schemas, and business logic for you. No boilerplate required.

---

## Prerequisites

- **Node.js** 20 or later
- **pnpm** (`npm install -g pnpm`)
- **Go** 1.22 or later (required by the PocketBase migration tooling)

---

## Getting started

```bash
pnpm install   # install all workspace dependencies
pnpm setup     # download PocketBase binary, copy app hooks
pnpm dev       # start PocketBase (port 8090) + Vite dev server (port 5173)
```

- Frontend: http://localhost:5173
- PocketBase Admin UI: http://localhost:8090/_/

> **First-time fork?** Click **"Use this template"** on GitHub, clone your new repo, then run the three commands above.

---

## Project structure

```
/
├── app/              ← YOUR APPLICATION FILES (edit these)
│   ├── screens/      ← UI Definition JSON, served by PocketBase
│   ├── behaviours/   ← JS modules for custom logic
│   └── hooks/        ← PocketBase server-side workflow hooks
│
├── frontend/         ← Platform runtime (React + Vite) — do not edit
│   └── src/
│       ├── renderer/     JSON → React engine
│       ├── components/   Base component library
│       ├── api/          PocketBase client & data binding
│       ├── behaviour/    Behaviour file loader
│       └── router/       Screen-driven route resolver
│
├── backend/          ← PocketBase binary and data
│   ├── pocketbase    (downloaded by pnpm setup, gitignored)
│   ├── pb_data/      (gitignored)
│   ├── pb_migrations/← App schema migrations
│   └── pb_hooks/     (populated from app/hooks/ by setup)
│
├── .claude/          ← Claude Code integration
│   ├── commands/     /gen-screen, /gen-behaviour, /gen-schema, /gen-workflow
│   └── prompts/      UI JSON spec, behaviour spec, PocketBase patterns
│
└── shared/           ← TypeScript types shared across layers
    └── types/
```

---

## Building your application

Open Claude Code in this repo and use the slash commands:

### Build your first screen

```
/gen-screen
```

Describe the screen you want (e.g. "a list of products with name, price, and category"). Claude Code generates a UI Definition JSON file in `app/screens/` that renders immediately — no code changes needed.

### Add a data collection

```
/gen-schema
```

Describe the data shape (e.g. "a products collection with name, price, description, and category"). Claude Code generates a PocketBase migration in `backend/pb_migrations/`. Restart PocketBase to apply it.

### Add a behaviour

```
/gen-behaviour
```

Describe the interaction (e.g. "auto-generate a slug from the product name on input"). Claude Code generates a JS module in `app/behaviours/` that screens can call via `runBehaviour`.

### Add a workflow hook

```
/gen-workflow
```

Describe the server-side logic (e.g. "send a notification when a product moves to published status"). Claude Code generates a PocketBase hook in `app/hooks/`.

---

## How it works

| Layer | Technology | Role |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind | Renders your app from JSON screen definitions |
| JSON UI engine | `@json-render/core` + `@json-render/react` | Turns screen JSON into live React components |
| Backend | PocketBase | REST API, SQLite database, static file serving |
| AI coding | Claude Code | Generates screens, schemas, and behaviour files |

`app/` and `frontend/` never import from each other. PocketBase serves `app/screens/*.json` and `app/behaviours/*.js` over HTTP — the frontend fetches them at runtime from `VITE_PB_URL`.

---

## Scripts

| Script | Description |
|---|---|
| `pnpm setup` | Download PocketBase binary, copy hook files |
| `pnpm dev` | Start PocketBase + Vite dev server concurrently |
| `pnpm build` | Production build of the frontend |
| `pnpm tsc` | TypeScript type-check (no emit) |

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_PB_URL` | `http://localhost:8090` | PocketBase origin for API and file serving |

Set it in `.env.development` for local dev, or in your hosting platform for production.

---

## Documentation

| Document | Purpose |
|---|---|
| [docs/IDEA.md](./docs/IDEA.md) | Full platform vision and architecture decisions |
| [docs/PHASE1.md](./docs/PHASE1.md) | Phase 1 spec: JSON UI format, component catalog, DataCall API |
