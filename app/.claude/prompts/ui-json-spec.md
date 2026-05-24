# UI Screen JSON Specification

Reference for generating and editing UI Definition JSON files in VibeForge. Screen files live in `app/screens/` and are served statically by PocketBase.

---

## Screen File Format

Every screen is a JSON file at `app/screens/<name>.json`.

```json
{
  "$schema": "../../shared/schemas/ui-screen.schema.json",
  "id": "post-form",
  "title": "New Post",
  "route": "/admin/posts/new",
  "data": [ /* DataCall array — see below */ ],
  "spec": {
    "root": "page",
    "elements": { /* flat element map — see below */ },
    "state": { /* initial state values */ }
  }
}
```

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `$schema` | string | recommended | Points to `../../shared/schemas/ui-screen.schema.json` — enables editor autocomplete |
| `id` | string | yes | Unique identifier matching the filename (without `.json`) |
| `title` | string | yes | Sets the page `<title>` |
| `route` | string | yes | React Router path. Use `:paramName` for URL params (e.g. `/posts/:id`) |
| `data` | DataCall[] | no | PocketBase queries this screen runs |
| `spec` | object | yes | json-render spec — rendered by the platform |
| `spec.root` | string | yes | ID of the root element in the elements map |
| `spec.elements` | object | yes | Flat map of all elements keyed by element ID |
| `spec.state` | object | no | Initial state values merged into the store before rendering |

---

## DataCall Format

DataCalls declare what PocketBase queries a screen needs.

```json
{
  "name": "posts",
  "action": "list",
  "collection": "posts",
  "filter": "status = 'published' && category = '{/ui/categoryFilter}'",
  "sort": "-created",
  "expand": "author,category",
  "trigger": "load"
}
```

| Field | Values | Purpose |
|-------|--------|---------|
| `name` | string | Result namespace: `/data/<name>/items`, `/data/<name>/_loading`, etc. |
| `action` | `list` `get` `create` `update` `delete` | PocketBase operation |
| `collection` | string | PocketBase collection name |
| `filter` | string | PocketBase filter expression. Use `{/path}` to read from state at call time |
| `sort` | string | PocketBase sort (e.g. `"-created"` for descending) |
| `expand` | string | Comma-separated relations to expand (e.g. `"author,category"`) |
| `id` | string or `{ "$route": "paramName" }` | Record ID for `get`/`update`/`delete` |
| `body` | object | For `create`/`update` — values read from state paths (e.g. `"/form/title"`) |
| `trigger` | `load` `manual` | `load` fires on mount; `manual` fires only via `callData` action |

### Filter State Substitution

Use `{/path}` in filter strings to inject state values at call time:

```json
"filter": "status = '{/ui/statusFilter}' && category = '{/ui/categoryId}'"
```

### Route Param in ID

For `get`, `update`, and `delete` actions that need the URL param:

```json
{ "id": { "$route": "id" } }
```

This reads the `:id` URL param and uses it as the record ID.

### Body from State

For `create` and `update`, map collection fields to state paths:

```json
"body": {
  "title": "/form/title",
  "slug": "/form/slug",
  "body": "/form/body",
  "category": "/form/category",
  "status": "draft"
}
```

Values starting with `/` are treated as state paths. Literal values (like `"draft"`) are used as-is.

---

## State Namespaces at Runtime

The `ScreenRenderer` initialises the state store by merging three sources:

| Namespace | Source | Example |
|-----------|--------|---------|
| `spec.state` values | Initial values from the screen file | `/form/title` = `""` |
| `/data/<callName>/items` | Results from a `list` DataCall | `/data/posts/items` = `[{...}]` |
| `/data/<callName>` | Result from a `get` DataCall | `/data/post` = `{id, title, ...}` |
| `/data/<callName>/totalItems` | Total count from a list call | `/data/posts/totalItems` = `42` |
| `/data/<callName>/_loading` | `true` while the call is in-flight | `/data/posts/_loading` = `false` |
| `/data/<callName>/_error` | Error message string or `null` | `/data/posts/_error` = `null` |
| `/route/params/<name>` | URL params from React Router | `/route/params/id` = `"abc123"` |

**Convention:** Use `/form/...` for form input values and `/ui/...` for UI-only flags (modal open, filter selection, etc.).

---

## Data Binding Expressions

These are json-render built-in expressions resolved before props reach React components.

| Expression | Use | Example |
|-----------|-----|---------|
| `{ "$state": "/path" }` | Read a value from state | `{ "$state": "/data/post/title" }` |
| `{ "$bindState": "/path" }` | Two-way form binding (value + onChange) | `{ "$bindState": "/form/email" }` |
| `{ "$item": "field" }` | Field on the current `repeat` item | `{ "$item": "title" }` |
| `{ "$index": true }` | Current `repeat` index (0-based) | — |
| `{ "$bindItem": "field" }` | Two-way bind on a repeat item | — |
| `{ "$template": "Hello ${/name}!" }` | String interpolation with state values | `{ "$template": "/posts/${/route/params/id}" }` |
| `{ "$cond": "/path", "$then": "a", "$else": "b" }` | Conditional value based on state | — |

---

## Platform Actions

Registered in the catalog so they can be used in element `actions` fields.

| Action | Params | Purpose |
|--------|--------|---------|
| `callData` | `{ "name": "callName" }` | Trigger a named DataCall defined in the screen's `data` array |
| `navigate` | `{ "to": "/path" }` | Navigate to a route. `to` supports `$template` interpolation |
| `runBehaviour` | `{ "file": "name", "fn": "exportName" }` | Call a named export from `app/behaviours/<file>.js` |

Actions can be a single object or an array (executed in sequence):

```json
"actions": {
  "submit": [
    { "action": "runBehaviour", "params": { "file": "validate", "fn": "onSubmit" } },
    { "action": "callData", "params": { "name": "createPost" } },
    { "action": "navigate", "params": { "to": "/admin/posts" } }
  ]
}
```

### navigate with dynamic path

```json
{ "action": "navigate", "params": { "to": "/posts/${/data/post/id}" } }
```

---

## Element Format

Each element in `spec.elements` follows this structure:

```json
"element-id": {
  "type": "ComponentName",
  "props": {
    "label": "Title",
    "value": { "$bindState": "/form/title" }
  },
  "children": ["child-id-1", "child-id-2"],
  "actions": {
    "change": { "action": "runBehaviour", "params": { "file": "...", "fn": "..." } },
    "click": { "action": "navigate", "params": { "to": "/posts" } }
  },
  "repeat": {
    "statePath": "/data/posts/items",
    "key": "id"
  },
  "showIf": { "$state": "/ui/modalOpen" }
}
```

| Field | Purpose |
|-------|---------|
| `type` | Component name from the catalog (e.g. `"Column"`, `"TextField"`) |
| `props` | Props passed to the component. Values can be literals or binding expressions |
| `children` | Ordered list of child element IDs (for slot components) |
| `actions` | Event handlers: `click`, `change`, `submit`, `rowClick`, etc. |
| `repeat` | Repeat the element for each item in a state array |
| `showIf` | Conditionally show/hide the element based on a state value |

### Element ID Naming Convention

Use descriptive, semantic IDs — not generic ones:

```
✅ post-title-field   post-form   save-btn   category-select
❌ field1             form1       btn        select
```

---

## Component Catalog

### Layout Components

**Column** — Vertical flex container.
```json
{
  "type": "Column",
  "props": { "gap": 6, "padding": 8, "align": "start" },
  "children": ["child-1", "child-2"]
}
```

**Row** — Horizontal flex container.
```json
{
  "type": "Row",
  "props": { "gap": 4, "align": "center", "wrap": true },
  "children": [...]
}
```

**Grid** — CSS grid.
```json
{ "type": "Grid", "props": { "cols": 3, "gap": 4 }, "children": [...] }
```

**Card** — Surface card with border and shadow.
```json
{ "type": "Card", "props": { "padding": 6 }, "children": [...] }
```

### Display Components

**Text** — Renders a heading or paragraph.
```json
{
  "type": "Text",
  "props": {
    "text": { "$state": "/data/post/title" },
    "variant": "h1",
    "color": "gray-900"
  }
}
```
`variant` options: `h1` `h2` `h3` `h4` `h5` `h6` `body` `caption`

**Badge** — Coloured label chip.
```json
{
  "type": "Badge",
  "props": {
    "label": { "$state": "/data/post/status" },
    "color": "green"
  }
}
```
`color` options: `green` `yellow` `red` `blue` `gray`

**Image** — `<img>` element.
```json
{ "type": "Image", "props": { "src": "...", "alt": "...", "width": 400, "height": 300 } }
```

**Divider** — Horizontal rule.
```json
{ "type": "Divider", "props": {} }
```

**Spacer** — Empty space.
```json
{ "type": "Spacer", "props": { "size": 4 } }
```

### Input Components

**TextField** — Single-line text input.
```json
{
  "type": "TextField",
  "props": {
    "label": "Title",
    "value": { "$bindState": "/form/title" },
    "placeholder": "Enter a title...",
    "required": true,
    "type": "text"
  },
  "actions": {
    "change": { "action": "runBehaviour", "params": { "file": "slug-autogenerate", "fn": "onTitleChange" } }
  }
}
```

**TextArea** — Multi-line text input.
```json
{
  "type": "TextArea",
  "props": { "label": "Body", "value": { "$bindState": "/form/body" }, "rows": 10 }
}
```

**Select** — Dropdown. Options from state or literal array.
```json
{
  "type": "Select",
  "props": {
    "label": "Category",
    "value": { "$bindState": "/form/category" },
    "options": { "$state": "/data/categories/items" }
  }
}
```

**Checkbox** — Boolean toggle.
```json
{
  "type": "Checkbox",
  "props": { "label": "Featured", "checked": { "$bindState": "/form/featured" } }
}
```

### Composite Components

**Button** — Clickable action trigger.
```json
{
  "type": "Button",
  "props": {
    "label": "Save",
    "variant": "primary",
    "loading": { "$state": "/data/createPost/_loading" },
    "disabled": false
  },
  "actions": { "click": { "action": "callData", "params": { "name": "createPost" } } }
}
```
`variant` options: `primary` `secondary` `danger` `ghost`

**Link** — Navigation link.
```json
{
  "type": "Link",
  "props": { "label": "Back to list", "to": "/admin/posts", "external": false }
}
```

**Form** — Wraps form fields. Fires `submit` action on form submission.
```json
{
  "type": "Form",
  "props": {},
  "children": ["title-field", "body-field", "save-btn"],
  "actions": {
    "submit": [
      { "action": "callData", "params": { "name": "createPost" } },
      { "action": "navigate", "params": { "to": "/admin/posts" } }
    ]
  }
}
```

**DataTable** — Table with column headers. Rows come from `repeat`.
```json
{
  "type": "DataTable",
  "props": {
    "columns": [
      { "key": "title", "label": "Title" },
      { "key": "status", "label": "Status" },
      { "key": "created", "label": "Created" }
    ],
    "emptyMessage": "No posts yet."
  },
  "repeat": { "statePath": "/data/posts/items", "key": "id" },
  "actions": {
    "rowClick": { "action": "navigate", "params": { "to": "/posts/${/route/params/id}" } }
  }
}
```

**Modal** — Dialog overlay. Visibility controlled by `showIf`.
```json
{
  "type": "Modal",
  "props": { "title": "Confirm Delete" },
  "showIf": { "$state": "/ui/confirmDeleteOpen" },
  "children": ["modal-body", "modal-actions"]
}
```

**Tabs** — Tabbed content.
```json
{
  "type": "Tabs",
  "props": {
    "tabs": [{ "id": "details", "label": "Details" }, { "id": "preview", "label": "Preview" }],
    "activeTab": { "$bindState": "/ui/activeTab" }
  },
  "children": ["details-tab-content", "preview-tab-content"]
}
```

---

## Full Annotated Example

The following is the complete `post-form` screen from the blog example. It demonstrates:
- Two DataCalls (one load, one manual create)
- Form with `$bindState` on every field
- Slug autogeneration behaviour on the title field
- Category select loaded from a list call
- Save button with loading state
- Form submit chains callData + navigate

```json
{
  "$schema": "../../shared/schemas/ui-screen.schema.json",
  "id": "post-form",
  "title": "New Post",
  "route": "/admin/posts/new",

  "data": [
    {
      "name": "categories",
      "action": "list",
      "collection": "categories",
      "sort": "name",
      "trigger": "load"
    },
    {
      "name": "createPost",
      "action": "create",
      "collection": "posts",
      "body": {
        "title": "/form/title",
        "slug": "/form/slug",
        "body": "/form/body",
        "category": "/form/category",
        "status": "draft"
      },
      "trigger": "manual"
    }
  ],

  "spec": {
    "root": "page",
    "state": {
      "form": { "title": "", "slug": "", "body": "", "category": "" }
    },
    "elements": {
      "page": {
        "type": "Column",
        "props": { "gap": 6, "padding": 8 },
        "children": ["page-title", "post-form"]
      },
      "page-title": {
        "type": "Text",
        "props": { "text": "New Post", "variant": "h1" },
        "children": []
      },
      "post-form": {
        "type": "Form",
        "props": {},
        "children": ["title-field", "slug-field", "category-field", "body-field", "save-btn"],
        "actions": {
          "submit": [
            { "action": "callData", "params": { "name": "createPost" } },
            { "action": "navigate", "params": { "to": "/admin/posts" } }
          ]
        }
      },
      "title-field": {
        "type": "TextField",
        "props": {
          "label": "Title",
          "value": { "$bindState": "/form/title" },
          "required": true
        },
        "children": [],
        "actions": {
          "change": {
            "action": "runBehaviour",
            "params": { "file": "slug-autogenerate", "fn": "onTitleChange" }
          }
        }
      },
      "slug-field": {
        "type": "TextField",
        "props": { "label": "Slug", "value": { "$bindState": "/form/slug" } },
        "children": []
      },
      "category-field": {
        "type": "Select",
        "props": {
          "label": "Category",
          "value": { "$bindState": "/form/category" },
          "options": { "$state": "/data/categories/items" }
        },
        "children": []
      },
      "body-field": {
        "type": "TextArea",
        "props": { "label": "Body", "value": { "$bindState": "/form/body" }, "rows": 12 },
        "children": []
      },
      "save-btn": {
        "type": "Button",
        "props": {
          "label": "Save Draft",
          "variant": "primary",
          "loading": { "$state": "/data/createPost/_loading" }
        },
        "children": []
      }
    }
  }
}
```

---

## Screen Registry: `app/screens/_index.json`

Every screen must be registered in `_index.json`. The router builds routes from this file.

```json
[
  { "id": "home", "route": "/", "title": "Home" },
  { "id": "post-detail", "route": "/posts/:id", "title": "Post" },
  { "id": "admin-posts", "route": "/admin/posts", "title": "Admin — Posts" },
  { "id": "post-new", "route": "/admin/posts/new", "title": "New Post" },
  { "id": "post-edit", "route": "/admin/posts/:id/edit", "title": "Edit Post" }
]
```

Special screen IDs:
- `_404` — rendered for unmatched routes
- `_home` — optional alias for `/` if no screen has `route: "/"`

When adding a new screen: create `app/screens/<id>.json` AND add an entry to `_index.json`.
