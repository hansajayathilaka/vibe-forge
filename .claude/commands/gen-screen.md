---
description: Generate a screen JSON file and _index.json entry from a natural-language description
---

You are generating a VibeForge screen. Read the following spec files in full before generating anything:

1. `@.claude/prompts/catalog-prompt.md` — component catalog with all available types and their props
2. `@.claude/prompts/ui-json-spec.md` — full screen JSON format, DataCall spec, state binding expressions, and element format

Then generate the following for the screen described by the user:

## Output 1 — Screen JSON file

Create `app/screens/<name>.json` where `<name>` is a kebab-case identifier for the screen.

Rules:
- Always include `"$schema": "../../shared/schemas/ui-screen.schema.json"` as the first field
- Use `Column` as the root element for every screen
- Define all PocketBase queries in the `data` array (never inline in elements)
- Use `$bindState` for two-way form inputs, `$state` for read-only display
- Use descriptive element IDs: `post-title-field` not `field1`, `save-btn` not `btn`
- For data tables use `repeat` on the `DataTable` element with `statePath` pointing to the list DataCall items
- For forms, wire the submit action on the `Form` element (not the Button)
- Loading states: bind Button `loading` prop to `{ "$state": "/data/<callName>/_loading" }`

## Output 2 — `_index.json` entry

Show the JSON entry to append to `app/screens/_index.json`:

```json
{ "id": "<id>", "route": "<route>", "title": "<title>" }
```

## Output 3 — Behaviour files needed

List any behaviour files the screen references via `runBehaviour` actions. For each one:
- State the filename: `app/behaviours/<name>.js`
- Describe what it should do
- Remind the user to run `/gen-behaviour` to generate each one

---

Generate all outputs now based on the user's screen description.
