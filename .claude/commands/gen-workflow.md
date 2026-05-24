---
description: Generate a PocketBase JS workflow hook from a description
---

You are generating a PocketBase JS workflow hook for VibeForge. Read the following spec file in full before generating:

`@.claude/prompts/pocketbase-patterns.md` — JS hook structure, available hook functions, event API, and global APIs (`$app`, `Record`, etc.)

Then generate a hook file for the workflow described by the user.

## Rules

- File path: `app/hooks/<name>.pb.js`
- Use the correct hook function: `onRecordCreate`, `onRecordUpdate`, `onRecordBeforeUpdate`, etc.
- Always call `return e.next()` at the end of the handler to continue the event chain
- Use `e.record.original().get("field")` to access the pre-update value of a field
- Filter to the correct collection by passing it as the second argument: `onRecordUpdate(fn, "posts")`
- Use `$app.findCollectionByNameOrId("name")` to reference other collections
- Use `new Record(col)` + `$app.save(record)` to create new records
- Throw an `Error` in `onRecordBefore*` hooks to reject the operation

## Output

Create the complete hook file at `app/hooks/<name>.pb.js`.

After generating, remind the user to:
1. Run `pnpm setup` from the repo root — this copies hooks from `app/hooks/` to `backend/pb_hooks/`
2. Restart PocketBase for the hook to take effect

Generate the hook file now based on the user's workflow description.
