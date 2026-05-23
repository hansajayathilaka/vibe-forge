# TASK-04 — Screen Config Fetcher

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-01 |
| **Blocks** | TASK-05, TASK-09 |

---

## Description

Build the module the frontend uses to load screen definitions and behaviour modules from PocketBase at runtime.

Phase 1 is file-only — PocketBase serves files from `app/` via `--publicDir`. This is a straightforward HTTP fetcher. The `ConfigSource` interface is defined now as a placeholder for the DB-backed implementation coming in a later phase.

### Interface

```typescript
// frontend/src/config/ConfigSource.ts
export interface ConfigSource {
  getScreen(screenId: string): Promise<UiScreen>
  getBehaviourModule(name: string): Promise<Record<string, Function>>
  listScreens(): Promise<ScreenMeta[]>
}

export interface ScreenMeta {
  id: string
  route: string
  title: string
}
```

### `FileConfigSource` implementation

- **`getScreen(id)`** → `fetch(`${PB_URL}/screens/${id}.json`)` then `res.json()`
- **`getBehaviourModule(name)`** → native dynamic import: `import(/* @vite-ignore */ `${PB_URL}/behaviours/${name}.js`)` — returns the ES module's exports directly. Results are cached in a `Map` so each file is only fetched once per session.
- **`listScreens()`** → `fetch(`${PB_URL}/screens/_index.json`)` — reads the screen registry file

### `_index.json` — screen registry

Static files cannot self-list, so each project maintains `app/screens/_index.json` manually (or via `/gen-screen` which appends to it automatically).

```json
[
  { "id": "home", "route": "/", "title": "Home" },
  { "id": "posts-list", "route": "/posts", "title": "Blog Posts" },
  { "id": "post-detail", "route": "/posts/:id", "title": "Post" }
]
```

### Singleton export

`frontend/src/config/index.ts` exports a pre-constructed singleton so nothing else needs to instantiate it:

```typescript
export const configSource: ConfigSource = new FileConfigSource(
  import.meta.env.VITE_PB_URL
)
```

---

## Deliverables

- [ ] `frontend/src/config/ConfigSource.ts` (interface + `ScreenMeta` type)
- [ ] `frontend/src/config/FileConfigSource.ts`
- [ ] `frontend/src/config/index.ts` (singleton export)
- [ ] `app/screens/_index.json` (starter with a single `home` placeholder entry)
