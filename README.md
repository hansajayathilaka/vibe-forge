# VibeForge

A low-code platform template for building data-driven web applications with Claude Code as your AI pair programmer. Fork this repo, describe your app, and let Claude Code generate screens, data schemas, and business logic for you.

---

## Quick start

```bash
# 1. Click "Use this template" on GitHub, then clone your new repo
git clone https://github.com/YOUR_USERNAME/YOUR_APP_NAME
cd YOUR_APP_NAME

# 2. Install dependencies and download PocketBase
pnpm install
pnpm setup

# 3. Start development (PocketBase + Vite in one command)
pnpm dev
```

- Frontend: http://localhost:5173
- PocketBase Admin UI: http://localhost:8090/_/

---

## How it works

| Layer | Technology | Role |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind | Renders your app from JSON screen definitions |
| JSON UI engine | `@json-render/core` + `@json-render/react` | Turns screen JSON into live React components |
| Backend | PocketBase | REST API, SQLite database, file serving |
| AI coding | Claude Code | Generates screens, schemas, and behaviour files |

Your application files live in `app/`. The platform runtime lives in `frontend/`. They never import from each other — PocketBase bridges them at runtime.

```
app/
├── screens/       ← UI Definition JSON files (one per screen)
├── behaviours/    ← JS modules for custom logic
└── hooks/         ← PocketBase server-side workflow hooks
```

---

## Generating application files with Claude Code

Open Claude Code in this repo and use the slash commands:

| Command | What it generates |
|---|---|
| `/gen-screen` | A screen JSON file in `app/screens/` |
| `/gen-schema` | A PocketBase migration in `backend/pb_migrations/` |
| `/gen-behaviour` | A behaviour JS module in `app/behaviours/` |
| `/gen-workflow` | A PocketBase hook in `app/hooks/` |

---

## Scripts

| Script | Description |
|---|---|
| `pnpm setup` | Download PocketBase binary, copy hook files |
| `pnpm dev` | Start PocketBase + Vite dev server concurrently |
| `pnpm build` | Production build of the frontend |
| `pnpm lint` | ESLint across the workspace |
| `pnpm tsc` | TypeScript type-check (no emit) |

---

## Environment variables

The frontend reads a single env var:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_PB_URL` | `http://localhost:8090` | PocketBase origin for API and file serving |

Set it in `.env.development` for local dev, or in your hosting platform for production.

---

## Documentation

| Document | Purpose |
|---|---|
| [docs/IDEA.md](./docs/IDEA.md) | Full platform vision and architecture decisions |
| [docs/PHASE1.md](./docs/PHASE1.md) | Phase 1 spec, JSON UI format, component catalog |
