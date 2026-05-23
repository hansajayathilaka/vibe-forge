# Phase 1 Task Progress

This file tracks the build status of all Phase 1 tasks. The `/next-task` slash command reads it to determine which task to implement next.

**Rule:** A task is buildable when its status is `pending` AND every task listed in `Blocked By` has status `done`.

| Task | Title | Status | Blocked By |
|------|-------|--------|------------|
| TASK-01 | Repo & Monorepo Setup | `done` | — |
| TASK-02 | Catalog Definition & Screen Schema | `done` | TASK-01 |
| TASK-03 | PocketBase Backend Setup | `done` | TASK-01 |
| TASK-04 | Screen Config Fetcher | `done` | TASK-01 |
| TASK-05 | ScreenRenderer | `pending` | TASK-02, TASK-04 |
| TASK-06 | Base Component Library | `pending` | TASK-05 |
| TASK-07 | API Client & Data Binding Layer | `pending` | TASK-03 |
| TASK-08 | Behaviour File Loader | `pending` | TASK-01 |
| TASK-09 | Router | `pending` | TASK-05 |
| TASK-10 | Claude Code Integration | `pending` | TASK-02, TASK-08 |
| TASK-11 | Example Application (Blog) | `pending` | TASK-06, TASK-07, TASK-08, TASK-09, TASK-10 |
| TASK-12 | Template Finalisation | `pending` | TASK-11 |

---

## How to Proceed

Run `/next-task` in Claude Code to pick up and implement the next buildable task automatically.

The command will:
1. Find the first `pending` task with all blockers `done`
2. Read the full spec from `docs/tasks/<TASK-NN-*.md>`
3. Implement all deliverables
4. Update this file (set status to `done`)
5. Commit and push

Repeat until all tasks are `done`.
