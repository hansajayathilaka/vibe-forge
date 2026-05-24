---
description: Generate a behaviour JS file from an interaction description
---

You are generating a VibeForge behaviour file. Read the following spec file in full before generating:

`@.claude/prompts/behaviour-file-spec.md` — behaviour file contract, BehaviourContext interface, state paths, and common patterns

Then generate `behaviours/<name>.js` for the interaction described by the user.

## Rules

- Use named exports only — no default export
- Every exported function receives a single `{ model, navigate }` context argument
- State paths use JSON Pointer format: `/form/field`, `/ui/flag`, `/data/callName/items`
- Use `model.get(path)` to read state and `model.set(path, value)` to write state
- Return `false` from a function to cancel the action chain (e.g. for validation failures)
- No external imports — plain JavaScript only (the file is served as-is by PocketBase)
- File must be `.js` not `.ts`

## Output

Create the complete behaviour file at `behaviours/<name>.js`.

After generating the file, show how to wire it into a screen element using a `runBehaviour` action:

```json
{
  "action": "runBehaviour",
  "params": { "file": "<name>", "fn": "<exportName>" }
}
```

Generate the behaviour file now based on the user's description.
