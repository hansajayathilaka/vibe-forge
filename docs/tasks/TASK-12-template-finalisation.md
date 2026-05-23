# TASK-12 — Template Repo Finalisation

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-11 |
| **Blocks** | — |

---

## Description

Polish and publish the repository as an official GitHub template. This is the last step — everything else must be working before this runs.

### `README.md`

Must cover:
- What this platform is (2–3 sentences)
- Prerequisites: Node 20+, pnpm, Go (for migrations)
- Getting started in 3 commands:
  ```bash
  pnpm install
  pnpm setup
  pnpm dev
  ```
- Project structure overview (the `app/`, `frontend/`, `backend/`, `.claude/` directories)
- How to build your first screen (`/gen-screen` in Claude Code)
- How to add a collection (`/gen-schema`)
- How to add a behaviour (`/gen-behaviour`)
- How to add a workflow hook (`/gen-workflow`)
- Links to `IDEA.md` and `PHASE1.md` for full context

### `.gitignore`

Excludes:
- `backend/pocketbase` (binary, downloaded by setup)
- `backend/pb_data/` (database files)
- `node_modules/`
- `.env.local`
- `dist/`
- `.DS_Store`

### `LICENSE`

MIT licence with current year and project author.

### `.github/workflows/typecheck.yml`

Runs `pnpm tsc --noEmit` on every push and pull request to the `main` branch. Keeps the TypeScript types honest without a full build.

```yaml
name: Type Check
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm tsc --noEmit
```

### GitHub template setting

Enable **Template repository** in the repo's Settings → General. This adds the "Use this template" button.

---

## Deliverables

- [ ] `README.md` (final version)
- [ ] `.gitignore`
- [ ] `LICENSE` (MIT)
- [ ] `.github/workflows/typecheck.yml`
- [ ] Repository marked as a GitHub template
- [ ] All Phase 1 Definition of Done items confirmed passing
