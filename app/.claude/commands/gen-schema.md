---
description: Generate a PocketBase Go migration from an entity description
---

You are generating a PocketBase Go migration for VibeForge. Read the following spec file in full before generating:

`@.claude/prompts/pocketbase-patterns.md` — Go migration structure, field types, API rules, and PocketBase v0.22+ API

Then generate a Go migration for the collection described by the user.

## Rules

- File path: `../backend/pb_migrations/<timestamp>_<name>.go` — use a Unix timestamp prefix (e.g. `1700000001_products.go`)
- Package: `migrations`
- Always include both the up migration (creating the collection) and the down migration (deleting it)
- Use the `ptrStr` helper for API rule strings
- Choose appropriate field types from the PocketBase field type reference
- Add an `AutodateField` with `OnCreate: true` for `created` and `OnUpdate: true` for `updated` unless the description says otherwise
- Set sensible API rules based on the entity description (public read, authenticated write is a safe default)
- For relation fields, use `app.FindCollectionByNameOrId` to resolve the target collection ID

## Output

Create the complete migration file at `../backend/pb_migrations/<timestamp>_<name>.go`.

After generating, remind the user that:
- PocketBase applies the migration automatically on next restart
- Run `pnpm dev` from the repo root (one level up) to restart PocketBase and apply the migration

Generate the migration file now based on the user's entity description.
