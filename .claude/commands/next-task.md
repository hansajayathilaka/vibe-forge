---
description: Pick up and implement the next pending Phase 1 task
---

You are a platform infrastructure engineer building VibeForge Phase 1.

## Step 1 — Find the next buildable task

Read `docs/tasks/PROGRESS.md`. Find the first task where:
- `Status` is `pending`
- Every task listed in `Blocked By` has status `done` (or the field is `—`)

That is your target task. If no such task exists, all buildable tasks are in progress or done — report the current state and stop.

## Step 2 — Read the full task specification

Read the file `docs/tasks/<TASK-NN-*.md>` that matches the task you found. Read it completely — every deliverable listed must be implemented.

Also read `docs/PHASE1.md` for the full architecture context, JSON UI spec, DataCall format, state namespaces, and component catalog.

## Step 3 — Load the relevant skill files

Based on what the task builds, read the appropriate prompt skill files:

- If the task involves **screen JSON, the renderer, json-render, or UI components** → read `@.claude/prompts/ui-json-spec.md`
- If the task involves **PocketBase migrations or JS hooks** → read `@.claude/prompts/pocketbase-patterns.md`
- If the task involves **behaviour files** → read `@.claude/prompts/behaviour-file-spec.md`

## Step 4 — Implement every deliverable

Create or modify every file listed in the task's **Deliverables** section. Follow the exact file paths specified. Key implementation rules:

- TypeScript: strict mode, no `any`, use types from `shared/types/`
- All Tailwind styling in components — no CSS files, no inline `style` objects
- Behaviour files are `.js` (not `.ts`) — they are served as-is by PocketBase
- Go migrations use the exact PocketBase v0.22+ API from `pocketbase-patterns.md`
- Screen JSON files must include `"$schema"` pointing to `../../shared/schemas/ui-screen.schema.json`
- Do NOT create files outside the directories specified in the task

## Step 5 — Verify

If the task created or modified TypeScript files in `frontend/` or `shared/`:
- Run `pnpm tsc --noEmit` from the repo root
- Fix any type errors before proceeding
- The build must be clean before marking the task done

If the task created screen JSON files:
- Validate they follow the screen wrapper format from `ui-json-spec.md`
- Ensure all element IDs are unique and descriptive (e.g. `post-title-field` not `field1`)

## Step 6 — Update the progress tracker

Open `docs/tasks/PROGRESS.md` and change the task's status from `` `pending` `` to `` `done` ``.

## Step 7 — Commit and push

Create a git commit with:
- All new and modified files staged
- Message format: `feat(TASK-NN): <task title from PROGRESS.md>`
- Push to the current branch: `git push -u origin $(git branch --show-current)`

## Step 8 — Report

Tell the user:
1. Which task you just completed
2. What files were created/modified
3. Which task is next (and whether it's now unblocked)

---

**Important constraints:**
- Never skip a deliverable — implement everything listed in the task spec
- Never implement deliverables from a future task — only the current task
- If you encounter an ambiguity in the task spec, check `docs/PHASE1.md` first, then `docs/IDEA.md`
- The `app/` and `frontend/` directories must stay cleanly separated — frontend never imports from app/ directly
