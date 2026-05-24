# Behaviour File Specification

Behaviour files contain the interactive JavaScript logic for a screen. They are plain ES modules loaded at runtime from PocketBase's static file server.

---

## File Location and Loading

```
app/behaviours/<name>.js    ← source of truth
```

PocketBase serves `app/` via `--publicDir`. At runtime the browser dynamically imports:

```
http://localhost:8090/behaviours/<name>.js
```

The `BehaviourLoader` in `frontend/src/behaviour/BehaviourLoader.ts` caches loaded modules.

**Phase 1 constraint:** Behaviour files run with full browser JavaScript access. There is no sandbox. They must not import external packages — only plain JavaScript.

---

## Contract

### Named exports only

```javascript
// ✅ Correct — named exports
export function onTitleChange({ model, navigate }) { ... }
export function onDeleteClick({ model }) { ... }

// ❌ Wrong — no default export
export default function() { ... }
```

### BehaviourContext

Every exported function receives a single `context` object:

```typescript
interface BehaviourContext {
  model: {
    get(path: string): unknown    // read state at a JSON Pointer path
    set(path: string, value: unknown): void  // write state at a JSON Pointer path
  }
  navigate(to: string): void      // navigate to a route
}
```

State paths use **JSON Pointer** format: `/segment/segment/...`

| Path | What it holds |
|------|--------------|
| `/form/<field>` | Form input values |
| `/ui/<flag>` | UI state (modal open, loading flag, etc.) |
| `/data/<callName>/items` | Results from a list DataCall |
| `/data/<callName>` | Result from a get DataCall |
| `/data/<callName>/_loading` | `true` while a DataCall is in flight |
| `/route/params/<name>` | URL params (e.g. `/route/params/id` for `/posts/:id`) |

---

## How to Wire a Behaviour in a Screen Spec

Add a `runBehaviour` action to the element that should trigger it:

```json
{
  "id": "title-field",
  "type": "TextField",
  "props": {
    "label": "Title",
    "value": { "$bindState": "/form/title" }
  },
  "children": [],
  "actions": {
    "change": {
      "action": "runBehaviour",
      "params": {
        "file": "slug-autogenerate",
        "fn": "onTitleChange"
      }
    }
  }
}
```

- `file` — the filename without `.js` (e.g. `"slug-autogenerate"` for `app/behaviours/slug-autogenerate.js`)
- `fn` — the exported function name to call

Actions can also be chained as an array:

```json
"actions": {
  "click": [
    { "action": "runBehaviour", "params": { "file": "confirm-delete", "fn": "onDeleteClick" } },
    { "action": "callData", "params": { "name": "deletePost" } }
  ]
}
```

---

## Common Patterns

### Slug Autogeneration

Watches the title field and auto-fills the slug field.

```javascript
// app/behaviours/slug-autogenerate.js

export function onTitleChange({ model }) {
  const title = model.get('/form/title') ?? ''
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  model.set('/form/slug', slug)
}
```

Wire on the title `TextField`'s `change` action.

### Confirm Delete (Modal Flag)

Opens a confirmation modal. The actual delete DataCall is chained in the spec after confirmation.

```javascript
// app/behaviours/confirm-delete.js

export function onDeleteClick({ model }) {
  model.set('/ui/confirmDeleteOpen', true)
}

export function onCancelDelete({ model }) {
  model.set('/ui/confirmDeleteOpen', false)
  model.set('/ui/deleteTargetId', null)
}

export function onConfirmDelete({ model }) {
  model.set('/ui/confirmDeleteOpen', false)
  // The callData action for the actual delete is chained after this in the spec
}
```

The Modal element uses `showIf` bound to `/ui/confirmDeleteOpen`.

### Dependent Field Population

Load sub-options when a parent select changes.

```javascript
// app/behaviours/category-filter.js

export function onCategoryChange({ model }) {
  const categoryId = model.get('/form/category')
  // Clear the sub-category when the parent changes
  model.set('/form/subcategory', '')
  // The callData action for loading subcategories is chained in the spec
}
```

### Form Validation Before Submit

Set error state that Text elements can display.

```javascript
// app/behaviours/post-form-validate.js

export function onSubmit({ model }) {
  const title = model.get('/form/title') ?? ''
  const body = model.get('/form/body') ?? ''

  if (title.trim().length < 3) {
    model.set('/ui/titleError', 'Title must be at least 3 characters')
    return false  // returning false cancels the action chain
  }

  model.set('/ui/titleError', null)
  model.set('/ui/bodyError', body.trim().length === 0 ? 'Body is required' : null)
}
```

Wire on the Form element's `submit` action before the `callData` action.

### Reading Route Params

```javascript
export function onLoad({ model }) {
  const postId = model.get('/route/params/id')
  // postId is now available for use
}
```

### Navigation

```javascript
export function onSaveSuccess({ model, navigate }) {
  // Navigate to admin list after successful save
  navigate('/admin/posts')
}
```

---

## Template for New Behaviour Files

```javascript
// app/behaviours/<name>.js
// <One-line description of what this behaviour does>

/**
 * @param {Object} context
 * @param {{ get: (path: string) => unknown, set: (path: string, value: unknown) => void }} context.model
 * @param {(to: string) => void} context.navigate
 */
export function <functionName>({ model, navigate }) {
  // implementation
}
```
