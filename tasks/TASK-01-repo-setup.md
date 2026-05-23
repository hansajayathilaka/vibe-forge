# TASK-01 — Repo & Monorepo Setup

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | — |
| **Blocks** | TASK-02, TASK-03, TASK-04, TASK-08 |

---

## Description

Initialise the repository structure as shown in the Phase 1 output definition. Set up a pnpm workspace covering `frontend/` and `shared/`. Configure TypeScript (strict mode), ESLint, and Prettier with project-wide settings in the root.

Add a root `package.json` with three scripts:

- `setup` → runs `scripts/setup.sh` (downloads PocketBase binary, copies hook files)
- `dev` → concurrently starts PocketBase (`./backend/pocketbase serve --publicDir ../app`) and the Vite dev server
- `build` → runs the Vite production build

`VITE_PB_URL` is the only runtime env var the frontend needs — it tells the app where PocketBase is running. Set it to `http://localhost:8090` in `.env.development`.

Mark the repo as a GitHub template from the start.

### Repository structure to initialise

```
/
├── .claude/
│   ├── commands/
│   └── prompts/
├── app/
│   ├── screens/
│   ├── behaviours/
│   └── hooks/
├── frontend/
│   ├── src/
│   │   ├── renderer/
│   │   ├── components/
│   │   ├── behaviour/
│   │   ├── api/
│   │   ├── catalog/
│   │   ├── config/
│   │   └── router/
│   ├── public/
│   └── vite.config.ts
├── backend/
│   ├── pb_migrations/
│   └── pb_hooks/
├── shared/
│   ├── types/
│   └── schemas/
├── scripts/
└── README.md
```

---

## Deliverables

- [ ] `pnpm-workspace.yaml`
- [ ] Root `tsconfig.json`, `.eslintrc`, `.prettierrc`
- [ ] Root `package.json` with `setup`, `dev`, `build` scripts
- [ ] `.env.development` with `VITE_PB_URL=http://localhost:8090`
- [ ] Skeleton `README.md`
- [ ] All directories above created (with `.gitkeep` where needed)
