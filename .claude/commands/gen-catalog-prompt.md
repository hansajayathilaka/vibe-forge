---
description: Regenerate app/.claude/prompts/catalog-prompt.md from the live component catalog
---

Run the following command from the repo root to regenerate the catalog reference that vibe coders use with `/gen-screen`:

```bash
NODE_PATH=frontend/node_modules npx tsx --tsconfig frontend/tsconfig.json scripts/gen-catalog-prompt.ts
```

This reads `frontend/src/catalog/index.ts`, generates a markdown component reference, and writes it to `app/.claude/prompts/catalog-prompt.md`.

Run this command whenever the component catalog changes (components added, removed, or props updated). Then commit `app/.claude/prompts/catalog-prompt.md` so vibe coders get the updated reference.
