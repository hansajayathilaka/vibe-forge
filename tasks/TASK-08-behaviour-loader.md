# TASK-08 — Behaviour File Loader

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-01 |
| **Blocks** | TASK-10, TASK-11 |

---

## Description

Build the mechanism that loads JS Behaviour Files on demand and makes their named exports available to the `runBehaviour` action handler in the registry.

### `BehaviourLoader` (`frontend/src/behaviour/BehaviourLoader.ts`)

Behaviour files are plain ES modules served by PocketBase from `app/behaviours/`. Use native dynamic `import()` — no wrapper, no sandbox in Phase 1.

```typescript
const cache = new Map<string, Record<string, Function>>()

export async function loadBehaviour(name: string): Promise<Record<string, Function>> {
  if (cache.has(name)) return cache.get(name)!
  const url = `${import.meta.env.VITE_PB_URL}/behaviours/${name}.js`
  const mod = await import(/* @vite-ignore */ url)
  cache.set(name, mod)
  return mod
}
```

Files are cached after first load so each behaviour module is fetched only once per session.

### Behaviour file contract

A behaviour file is a standard ES module that exports named functions. Each function receives a **behaviour context** object:

```typescript
// BehaviourContext type
interface BehaviourContext {
  model: {
    get: (path: string) => any   // JSON Pointer, e.g. "/form/title"
    set: (path: string, value: any) => void
  }
  navigate: (to: string) => void
}
```

Example behaviour file:

```javascript
// app/behaviours/slug-autogenerate.js

export function onTitleChange({ model }) {
  const title = model.get('/form/title')
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  model.set('/form/slug', slug)
}
```

The behaviour has access to the full unified state model via JSON Pointer paths — the same paths used in the screen JSON. It can read API results (`/data/posts/items`), route params (`/route/params/id`), and form state (`/form/title`), and write to any model path.

### Document the contract

`.claude/prompts/behaviour-file-spec.md` must cover:
- What a behaviour file is and where it lives (`app/behaviours/<name>.js`)
- The named export pattern
- The full `BehaviourContext` type with all fields
- How model paths map to screen state (`/form/`, `/data/`, `/route/params/`)
- How to trigger a behaviour from a screen (`runBehaviour` action with `file` + `fn`)
- A complete annotated example (slug generation)
- Common patterns: confirm before delete, dependent field population, format transformation

---

## Deliverables

- [ ] `frontend/src/behaviour/BehaviourLoader.ts`
- [ ] `frontend/src/behaviour/BehaviourContext.ts` (TypeScript interface for the context object)
- [ ] `.claude/prompts/behaviour-file-spec.md`
