# Phase 1 — Scaffolding & Runtime Foundation

> **Goal**: Produce a GitHub template repository that is the starting point for any application built on this platform. A developer forks the template, fires up Claude Code, and can build a full data-driven application without writing boilerplate from scratch.

---

## Phase Overview

### What we are building

| Layer | What ships in Phase 1 |
|---|---|
| **Runtime Frontend** | A React application that renders its entire UI from UI Definition JSON files fetched at runtime |
| **Backend** | A PocketBase instance that stores **only app data** (the collections the app needs, e.g. posts, users). No platform-level config tables. |
| **File serving** | PocketBase serves UI JSON and JS Behaviour Files directly from the filesystem via its `--publicDir` flag. The frontend always fetches from the PocketBase origin. |
| **JS Behaviour layer** | Behaviour files are plain ES modules loaded via dynamic `import()`. No sandbox in Phase 1. |
| **Claude Code integration** | A tuned `CLAUDE.md`, prompt library, and custom slash-command scripts so Claude Code understands the architecture and can generate correct artefacts |
| **Example application** | A minimal blog app built on the scaffold to prove everything works end-to-end |
| **Template repo** | Published as a GitHub template — fork it, run two commands, start building |

### What is explicitly out of scope

- Visual/browser-based Vibe Coding IDE (later phase)
- DB-backed config serving — UI JSON and behaviour files come from the filesystem only in Phase 1
- JS behaviour sandboxing — plain ES modules, no VM isolation
- Platform-level collections (`ui_definitions`, `behaviour_files`, etc.) — added in a future phase
- Multi-tenancy
- Production deployment pipelines / CI

---

## File Serving Architecture

This is the key structural decision of Phase 1.

### The problem

UI Definition JSON files and JS Behaviour Files are **application-level artefacts** — they belong to the app being built, not to the frontend bundle or the backend source code. They need to be:

1. Editable without rebuilding anything
2. Fetchable by the browser at runtime
3. Served from a stable origin that won't change when we switch from file mode to DB mode in a later phase

### The solution: PocketBase as the static file server

PocketBase accepts a `--publicDir` flag. Any directory passed to it is served as static files from PocketBase's root URL. We point it at the `app/` directory:

```
./pocketbase serve --publicDir ../app
```

This means:
- `app/screens/posts-list.json` → `http://localhost:8090/screens/posts-list.json`
- `app/behaviours/slug-autogenerate.js` → `http://localhost:8090/behaviours/slug-autogenerate.js`

The frontend fetches all configuration from the PocketBase origin (`VITE_PB_URL`). The same origin also serves the data API (`/api/collections/...`). This means there is **one env var** to configure and **one origin** the frontend talks to.

When a future phase adds DB-backed config, PocketBase custom routes will intercept requests to `/screens/` and `/behaviours/` and serve from the database instead of the filesystem — **the frontend code does not change at all**.

### Directory layout: `app/`

```
app/
├── screens/           ← UI Definition JSON files (one per screen)
│   └── *.json
├── behaviours/        ← JS Behaviour Files (one per interaction concern)
│   └── *.js
└── hooks/             ← PocketBase workflow hook scripts
    └── *.pb.js        ← copied into backend/pb_hooks/ on setup
```

`app/hooks/` files are **not** served over HTTP — they are backend code. `scripts/setup.sh` copies them into `backend/pb_hooks/` so PocketBase picks them up. Changes to hook files require a PocketBase restart.

---

## Output Definition

At the end of Phase 1, the repository contains:

```
/
├── .claude/
│   ├── CLAUDE.md                    ← project context for Claude Code
│   ├── commands/                    ← custom slash commands
│   │   ├── gen-screen.md            ← /gen-screen
│   │   ├── gen-behaviour.md         ← /gen-behaviour
│   │   ├── gen-schema.md            ← /gen-schema
│   │   └── gen-workflow.md          ← /gen-workflow
│   └── prompts/
│       ├── ui-json-spec.md          ← full UI JSON schema reference
│       ├── behaviour-file-spec.md   ← behaviour file contract
│       └── pocketbase-patterns.md  ← migration + hook patterns
│
├── app/                             ← YOUR APPLICATION FILES (edit these)
│   ├── screens/                     ← UI Definition JSON, served by PocketBase
│   ├── behaviours/                  ← JS Behaviour Files, served by PocketBase
│   └── hooks/                       ← PocketBase workflow hooks (copied to pb_hooks/)
│
├── frontend/                        ← Runtime Frontend (React + Vite)
│   ├── src/
│   │   ├── renderer/                ← JSON → React engine
│   │   ├── components/              ← base component library
│   │   ├── behaviour/               ← behaviour file loader
│   │   ├── api/                     ← PocketBase API client & binding layer
│   │   └── router/                  ← route resolver (driven by screen list)
│   ├── public/                      ← frontend static assets (favicon, etc.)
│   └── vite.config.ts
│
├── backend/
│   ├── pocketbase                   ← binary (gitignored, downloaded on setup)
│   ├── pb_data/                     ← gitignored
│   ├── pb_migrations/               ← app schema migrations live here
│   └── pb_hooks/                    ← populated from app/hooks/ by setup.sh
│
├── shared/
│   └── types/
│       ├── ui-definition.ts         ← UiScreen, UiComponent, DataCall…
│       └── workflow.ts
│
├── scripts/
│   └── setup.sh                     ← download PocketBase, copy hooks
│
└── README.md
```

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Frontend framework | **React 18 + Vite** | Fast dev server, easy dynamic imports |
| Language | **TypeScript** | Type safety on the UI JSON schema is critical |
| Styling | **Tailwind CSS** | Utility-first; no CSS files per component |
| Backend | **PocketBase** | Single binary, SQLite, auto REST + Realtime, JS hooks |
| JSON UI engine | **`@json-render/core` + `@json-render/react`** (Vercel Labs) | Catalog-based renderer; we define components + actions, the library handles rendering, state, expressions, repeat, and visibility |
| Schema validation | **Zod** | Catalog prop schemas — required by json-render |
| Behaviour loading | **Dynamic `import()`** | Native browser ES module loading; no wrapper needed |
| Package manager | **pnpm** | Workspace support for the monorepo |

---

## JSON UI Engine — Specification

This is the most critical design decision in Phase 1. Everything — the renderer, the component library, the Claude prompts — is built against this spec.

### Library: `@json-render/core` + `@json-render/react`

Instead of writing the renderer, expression resolver, state management, repeat logic, or visibility system ourselves, we use **json-render** (Vercel Labs, Apache 2.0, 15k⭐). It is purpose-built for exactly this use case: AI-generated UIs constrained to a developer-defined catalog.

What the library gives us for free:
- Flat element tree renderer (`<Renderer spec={spec} registry={registry} />`)
- JSON Pointer state binding (`{ "$state": "/user/name" }`)
- Two-way form bindings (`{ "$bindState": "/form/email" }`)
- Repeat over arrays (`repeat: { statePath: "/items", key: "id" }`)
- Per-item context (`{ "$item": "title" }`, `{ "$index": true }`)
- Conditional props (`$cond` / `$then` / `$else`)
- Template string interpolation (`{ "$template": "Hello, ${/name}!" }`)
- Visibility rules (show/hide elements based on state conditions)
- External state store (`createStateStore`) — we drive this with PocketBase data
- `catalog.prompt()` — auto-generates the Claude Code system prompt from the catalog definition

What we still build:
- The React components themselves (the actual UI)
- The catalog definition (Zod schemas declaring what AI can generate)
- The screen wrapper (route, PocketBase data calls, screen metadata)
- The PocketBase ↔ state store bridge
- Behaviour file loader and action handler wiring

---

### Screen file structure

A screen file is our **platform wrapper** around a json-render spec. It adds routing and PocketBase data calls. The `spec` field is a standard json-render spec that the library renders directly.

```json
{
  "$schema": "../../shared/schemas/ui-screen.schema.json",
  "id": "posts-list",
  "title": "Blog Posts",
  "route": "/posts",
  "data": [...],
  "spec": {
    "root": "root-element-id",
    "elements": { ... },
    "state": { ... }
  }
}
```

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Unique screen identifier — matches the filename |
| `title` | string | Page `<title>` |
| `route` | string | React Router path, supports params: `/posts/:id` |
| `data` | DataCall[] | PocketBase queries this screen runs |
| `spec` | json-render Spec | Standard json-render spec — the library renders this |

---

### `spec` — json-render format

The spec is a standard json-render document. It has three fields:

```json
{
  "root": "page",
  "elements": {
    "page": {
      "type": "Column",
      "props": { "gap": 6 },
      "children": ["title", "content"]
    },
    "title": {
      "type": "Text",
      "props": { "text": { "$state": "/post/title" }, "variant": "h1" },
      "children": []
    }
  },
  "state": {
    "post": { "title": "", "body": "" }
  }
}
```

- **`root`** — ID of the root element
- **`elements`** — flat map of all elements, keyed by ID. No nesting. Children reference each other by ID.
- **`state`** — initial state. At runtime, the `ScreenRenderer` merges in PocketBase results and route params before passing this to `StateProvider`.

---

### Data binding expressions (json-render built-in)

| Expression | Use | Example |
|---|---|---|
| `{ "$state": "/path" }` | Read from state | `{ "$state": "/posts/0/title" }` |
| `{ "$bindState": "/path" }` | Two-way form binding | `{ "$bindState": "/form/email" }` |
| `{ "$item": "field" }` | Field on current repeat item | `{ "$item": "title" }` |
| `{ "$index": true }` | Current repeat index | — |
| `{ "$template": "Hello ${/name}!" }` | String interpolation | — |
| `{ "$cond": ..., "$then": ..., "$else": ... }` | Conditional value | — |
| `{ "$bindItem": "field" }` | Two-way bind on repeat item | — |

---

### State namespaces (runtime)

`ScreenRenderer` initialises the store with three merged namespaces:

| Namespace | Source |
|---|---|
| `/form/...`, `/ui/...` and any key from `spec.state` | Initial values from `spec.state` |
| `/data/<callName>/items` etc. | PocketBase load-call results injected at runtime |
| `/route/params/<name>` | URL params injected at runtime |

---

### DataCall

```json
{
  "name": "categories",
  "action": "list",
  "collection": "categories",
  "sort": "name",
  "trigger": "load"
}
```

| Field | Values | Purpose |
|---|---|---|
| `name` | string | Result namespace: `/data/<name>/items`, `/data/<name>/_loading`, etc. |
| `action` | `list` `get` `create` `update` `delete` | PocketBase operation |
| `collection` | string | PocketBase collection name |
| `filter` | string | PocketBase filter. Can read state: uses `store.get("/form/status")` at call time |
| `sort` | string | PocketBase sort |
| `id` | string | Record ID for `get`/`update`/`delete`. Use `{ "$route": "id" }` to pull from URL |
| `body` | object | For `create`/`update`. Values read from state at call time |
| `expand` | string | PocketBase expand |
| `trigger` | `load` `manual` | `load` fires on screen mount; `manual` fires only via a `callData` action |

---

### Platform actions (registered in the catalog)

These are registered as catalog actions so Claude Code can generate them in specs.

| Action | Params | Purpose |
|---|---|---|
| `callData` | `{ name: string }` | Trigger a named DataCall |
| `navigate` | `{ to: string }` | React Router navigation. `to` supports `$template` syntax |
| `runBehaviour` | `{ file: string, fn: string }` | Call a named export from a behaviour file |

Standard json-render state actions (`setState`, etc.) are also available.

---

### Component catalog

These are defined using `defineCatalog` from `@json-render/core`. Each component has a Zod schema for its props.

| Component | Key Props | Notes |
|---|---|---|
| `Column` | `gap` `padding` `align` | Vertical flex container. Has `default` slot. |
| `Row` | `gap` `padding` `align` `wrap` | Horizontal flex. Has `default` slot. |
| `Grid` | `cols` `gap` | CSS grid. Has `default` slot. |
| `Card` | `padding` | Surface card. Has `default` slot. |
| `Text` | `text` `variant` (h1–h6, body, caption) `color` | Literal or `$state` bound |
| `Button` | `label` `variant` (primary/secondary/danger/ghost) `disabled` `loading` | Fires `action` on click |
| `Link` | `label` `to` `external` | React Router or `<a>` |
| `Image` | `src` `alt` `width` `height` | |
| `Divider` | — | |
| `Badge` | `label` `color` (green/yellow/red/blue/gray) | |
| `Spacer` | `size` | |
| `DataTable` | `columns` `emptyMessage` | Uses `repeat` for rows. `columns`: `[{ key, label, format? }]`. Fires `rowClick` action. |
| `Form` | — | Wraps fields. Has `default` slot. Fires `submit` action. |
| `TextField` | `label` `placeholder` `required` `type` | Use `{ "$bindState": "/path" }` on `value` |
| `TextArea` | `label` `rows` | Use `$bindState` on `value` |
| `Select` | `label` `options` | `options`: literal array or `$state` bound. Use `$bindState` on `value`. |
| `Checkbox` | `label` | Use `$bindState` on `checked` |
| `Modal` | `title` | Has `default` slot. Visibility via `showIf` bound to a state flag. |
| `Tabs` | `tabs` | `tabs`: `[{ id, label }]`. Active tab managed via `$bindState`. Has named slots per tab id. |

---

### Full Screen Example

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
      "body": { "title": "form.title", "slug": "form.slug", "body": "form.body", "category": "form.category", "status": "draft" },
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
          "change": { "action": "runBehaviour", "params": { "file": "slug-autogenerate", "fn": "onTitleChange" } }
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

## Tasks

> Full task descriptions live in the `tasks/` directory. This table is the index.

| Task | Title | Blocked by | Status |
|---|---|---|---|
| [TASK-01](./tasks/TASK-01-repo-setup.md) | Repo & Monorepo Setup | — | `pending` |
| [TASK-02](./tasks/TASK-02-catalog-definition.md) | Catalog Definition & Screen Schema | TASK-01 | `pending` |
| [TASK-03](./tasks/TASK-03-pocketbase-setup.md) | PocketBase Backend Setup | TASK-01 | `pending` |
| [TASK-04](./tasks/TASK-04-screen-config-fetcher.md) | Screen Config Fetcher | TASK-01 | `pending` |
| [TASK-05](./tasks/TASK-05-screen-renderer.md) | ScreenRenderer | TASK-02, TASK-04 | `pending` |
| [TASK-06](./tasks/TASK-06-component-library.md) | Base Component Library | TASK-05 | `pending` |
| [TASK-07](./tasks/TASK-07-api-client.md) | API Client & Data Binding Layer | TASK-03 | `pending` |
| [TASK-08](./tasks/TASK-08-behaviour-loader.md) | Behaviour File Loader | TASK-01 | `pending` |
| [TASK-09](./tasks/TASK-09-router.md) | Router | TASK-04, TASK-05 | `pending` |
| [TASK-10](./tasks/TASK-10-claude-integration.md) | Claude Code Integration | TASK-02, TASK-08 | `pending` |
| [TASK-11](./tasks/TASK-11-example-app.md) | Example Application (Blog) | TASK-06–10 | `pending` |
| [TASK-12](./tasks/TASK-12-template-finalisation.md) | Template Repo Finalisation | TASK-11 | `pending` |

---

## Task Dependency Order

```
Task 1 (Repo Setup)
    │
    ├──► Task 2 (UI JSON Types & Schema)
    │        │
    │        ├──► Task 5 (Renderer)
    │        │        ├──► Task 6 (Components)
    │        │        └──► Task 9 (Router)
    │        │
    │        └──► Task 10 (Claude Integration)
    │
    ├──► Task 3 (PocketBase Setup)
    │        └──► Task 7 (API Client)
    │
    ├──► Task 4 (Screen Config Fetcher)
    │
    └──► Task 8 (Behaviour Loader)

All of Tasks 1–10 must be done before:

    Task 11 (Example Blog App)
        └──► Task 12 (Template Finalisation)
```

Recommended execution order: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12**

---

## Definition of Done

Phase 1 is complete when:

- [ ] `git clone <template> && pnpm setup && pnpm dev` produces a running app with no additional steps
- [ ] All five blog example screens render correctly via json-render from JSON files served by PocketBase
- [ ] The blog CRUD flow works end-to-end: list posts → view post → create post → edit post → delete post
- [ ] `$bindState` two-way binding works on all form fields (title, slug, category, body)
- [ ] `repeat` renders the posts list correctly from the `/data/posts/items` state path
- [ ] Slug autogeneration behaviour (`runBehaviour` action) fires correctly on title input
- [ ] The post-status hook fires and creates an audit log record when a post moves to `pending_review`
- [ ] `scripts/gen-catalog-prompt.ts` produces a valid prompt from `catalog.prompt()`
- [ ] All four Claude Code slash commands (`/gen-screen`, `/gen-behaviour`, `/gen-schema`, `/gen-workflow`) produce valid, working output for a new entity ("a product catalogue")
- [ ] TypeScript compilation passes with zero errors
- [ ] The GitHub repository is marked as a template

---

*Last updated: 2026-05-23 — JSON UI engine finalised, file serving architecture decided, sandbox and DB config deferred.*
