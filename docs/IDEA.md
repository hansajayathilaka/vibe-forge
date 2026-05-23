# VibeForge — Low-Code Platform with Safe Vibe Coding

> **This document is the source of truth for the project idea.**  
> Update it as the design evolves. Do not let implementation drift from what is written here without also updating this file.

---

## 1. Vision

A **scalable low-code platform** that lets developers and non-developers alike build full-featured web applications through an AI-assisted visual builder ("vibe coding") — without sacrificing safety, extensibility, or production reliability.

The core promise:

- **No vendor lock-in on the UI** — the entire frontend is data-driven from a JSON schema, not hard-coded components.
- **Safe AI code generation** — the AI can write and modify JS behaviour files, UI JSON, database schemas, API bindings, and workflow definitions, but everything is human-readable, version-controlled, and auditable.
- **Seamless dev → prod promotion** — in development the platform reads config from files; in production it reads from the database, enabling live configuration changes without a redeploy.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users / Builders                     │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
     ┌──────────▼──────────┐   ┌──────────▼──────────┐
     │   Frontend 1        │   │   Frontend 2         │
     │   (Runtime App)     │   │   (Vibe Coding IDE)  │
     └──────────┬──────────┘   └──────────┬───────────┘
                │                         │
                └────────────┬────────────┘
                             │
                  ┌──────────▼──────────┐
                  │      Backend        │
                  │  (PocketBase /      │
                  │   Supabase / etc.)  │
                  └─────────────────────┘
```

Both frontends share the **same single backend instance**. The backend is a prebuilt, self-hostable platform — not a custom server — keeping infrastructure overhead minimal.

---

## 3. Component Breakdown

### 3.1 Frontend 1 — Runtime Application

This is the application that **end-users actually interact with**. It has no hard-coded UI.

| Concern | Mechanism |
|---|---|
| UI structure & layout | Loaded from a **UI Definition JSON** at runtime |
| Component behaviour | **JS Behaviour Files** fetched dynamically and executed in a sandboxed context |
| Data | API calls defined inside the UI JSON, bound to backend collections/endpoints |
| Routing | Routes are declared in the UI JSON; the renderer handles navigation |

**UI Definition JSON** describes every screen: which components to render, their properties, data bindings, event handlers (referencing JS Behaviour Files by name), and layout rules. Think of it as a serialised React/component tree that is interpreted, not compiled.

**JS Behaviour Files** are small, focused JavaScript modules (e.g. `blog-editor.js`, `approval-actions.js`) that contain interaction logic which cannot be expressed declaratively in JSON. They are loaded on demand — only for the screens that need them.

### 3.2 Frontend 2 — Vibe Coding IDE

This is the **builder interface** used by developers (or AI agents) to create and modify applications. It surfaces:

- A **JSON editor + visual UI builder** to create/edit the UI Definition JSON.
- A **code editor** for writing JS Behaviour Files.
- A **schema designer** to define database tables and relationships in the backend.
- An **API integration panel** to define and bind backend API endpoints into the UI JSON.
- A **workflow editor** for backend automation rules (approval chains, rejection flows, notifications, scheduled tasks, etc.).
- An **AI chat panel** ("vibe coding") where a natural-language prompt ("create a blog post application") triggers the AI to generate all of the above artefacts coherently.

### 3.3 Backend — Prebuilt Platform (PocketBase / Supabase)

The backend is not written from scratch. A prebuilt platform provides:

- **Database** (collections / tables)
- **REST & Realtime APIs** auto-generated from the schema
- **Authentication & authorisation**
- **File storage**
- **Custom server-side hooks / functions** for workflow execution

**Chosen platform: PocketBase.**

PocketBase is a single self-contained binary — embedded SQLite database, auto-generated REST & Realtime APIs, built-in auth, file storage, and a Go-based hooks system. It requires zero external infrastructure, making it ideal for both local development and self-hosted production deployments.

---

## 4. The AI / Vibe Coding Flow

When a builder types a prompt like **"create a blog post application"**, the system executes a structured generation pipeline:

```
Prompt
  │
  ▼
1. Intent parsing          → identify entities (Post, Author, Category…),
                             relationships, required features
  │
  ▼
2. Schema generation       → define DB collections/tables + field types
                             send to backend API to create them
  │
  ▼
3. API binding             → enumerate CRUD endpoints auto-generated by backend,
                             map them to UI actions
  │
  ▼
4. UI JSON generation      → produce screen definitions for:
                             list view, detail view, create/edit form, etc.
  │
  ▼
5. JS Behaviour File gen   → write interaction logic that cannot live in JSON
                             (rich text editor init, slug auto-generation, etc.)
  │
  ▼
6. Workflow file gen       → draft → review → approve/reject lifecycle,
                             email notifications, scheduled publishing
  │
  ▼
7. Preview & diff          → show builder what was created/changed,
                             allow accept / reject / edit before commit
```

"Safe" vibe coding means:

- The AI **never executes arbitrary code directly** against the database or runtime.
- Every generated artefact is **shown to the builder as a diff** before being committed.
- JS Behaviour Files run in a **sandboxed JS context** in the browser (no Node APIs, no direct backend access — only through the defined API surface).
- Generated schema changes go through the backend's standard **migration / schema API**, not raw SQL.
- Role-based access control from the backend platform constrains what the AI can touch.

---

## 5. Dev vs Production Config Strategy

This is one of the core architectural decisions.

### Development Mode

```
Runtime App reads UI JSON & JS files
        │
        └──► directly from the filesystem (local dev server)
```

- Instant feedback loop: edit a JSON file or JS file, refresh, see the change.
- No database round-trip for config.
- The Vibe Coding IDE writes files to disk.

### Production Mode

```
Runtime App reads UI JSON & JS files
        │
        └──► from database records (backend collections)
```

- UI Definition JSONs are stored as records in a dedicated `ui_definitions` collection.
- JS Behaviour Files are stored as text blobs in a `behaviour_files` collection.
- Workflow definitions are stored similarly.
- A **Promote to Production** action in the IDE syncs the current file state into the database.
- Once in production, **changes can be made live** by updating the database records — no redeploy, no file system access required.
- This also enables **per-tenant or per-environment overrides** by scoping records to a tenant/environment ID.

### Config Source Switch

A single environment variable / runtime flag controls the source:

```
CONFIG_SOURCE=file    # development
CONFIG_SOURCE=db      # production
```

The Runtime App's config loader is abstracted behind an interface; both modes implement the same contract.

---

## 6. Artefact Types (Summary)

| Artefact | Format | Stored in (Dev) | Stored in (Prod) |
|---|---|---|---|
| UI Definition | JSON | `.json` file | `ui_definitions` DB collection |
| JS Behaviour File | ES Module JS | `.js` file | `behaviour_files` DB collection |
| Workflow Definition | JSON / YAML | `.yaml` file | `workflows` DB collection |
| Backend Schema | JSON / migration file | migration files | Backend DB schema (applied) |
| API Bindings | Part of UI JSON | Same as UI JSON | Same as UI JSON |

---

## 7. Scalability Considerations

- **Frontend 1** is purely a static renderer — it can be served from a CDN. Scale = infinite.
- **Frontend 2** (IDE) only needs to be accessible to builders; can be gated behind auth and deployed separately.
- **Backend** scalability depends on chosen platform:
  - PocketBase: vertical scaling, or use distributed SQLite setups (Litestream for replication).
  - Supabase: horizontal Postgres scaling, connection pooling via PgBouncer.
- **Config as DB records** means the UI can be updated without touching CDN-cached static assets.
- **JS Behaviour Files** served from DB can be edge-cached by content hash.

---

## 8. Security Model

| Risk | Mitigation |
|---|---|
| AI generates malicious JS | Sandboxed execution context; code reviewed before commit |
| Unauthorised config change in prod | Backend row-level security; only admin role can write to config collections |
| JS Behaviour File XSS | Content Security Policy; behaviour files cannot access cookies or localStorage directly |
| Schema injection via AI | Schema changes go through typed API, not raw DDL |
| Over-permissive API bindings | Each API binding declares exactly the backend role/scope required; reviewed at promote-time |

---

## 9. Example: Blog Post Application Build

**Prompt:** `"Create a blog post application with draft/publish workflow and category tagging"`

**Generated output:**

1. **Schema**
   - `posts` (id, title, slug, body, status, author, category, created, updated)
   - `categories` (id, name, slug)
   - `post_reviews` (id, post_id, reviewer, decision, comment, reviewed_at)

2. **UI JSON screens**
   - `/posts` — paginated list with search, filter by status/category
   - `/posts/new` — create form with rich text body editor
   - `/posts/:id` — detail / edit form, status badge, review history
   - `/categories` — CRUD list

3. **JS Behaviour Files**
   - `slug-autogenerate.js` — watches title field, auto-populates slug
   - `rich-text-editor.js` — initialises a rich text editor component
   - `post-status-actions.js` — handles submit for review / publish / reject button logic

4. **Workflow Definition**
   - `post-approval.yaml` — on status change to `pending_review`, notify reviewers; on approve set status `published`; on reject set status `draft` with comment

5. **API Bindings** (inside UI JSON)
   - `GET /api/collections/posts/records` → list screen
   - `POST /api/collections/posts/records` → create form submit
   - `PATCH /api/collections/posts/records/:id` → edit form submit
   - `GET /api/collections/categories/records` → category dropdown

---

## 10. Decisions Log

| Decision | Choice | Notes |
|---|---|---|
| Backend platform | **PocketBase** | Single binary, embedded SQLite, Go hooks, zero external infra |
| Workflow engine | **PocketBase hooks** | Go hook scripts on collection events (onCreate, onUpdate, etc.), generated and managed by the Vibe Coding IDE |

## 11. Open Questions (resolved per phase)

The following are deferred and will be decided as each development phase begins. Do not pre-design them upfront.

- **UI JSON schema spec** — component types, event model, data binding syntax
- **JS Behaviour File sandbox** — iframe, Web Workers, SES, or custom VM
- **Promote to production UX** — exact diff/review/promote flow in the IDE
- **Multi-tenancy** — single instance per app vs one instance serving multiple apps
- **Version history** — rollback capability for UI JSON and behaviour files in the DB
- **Plugin / component marketplace** — custom component types in the JSON renderer

---

## 12. Phases

| Phase | Summary | Status |
|---|---|---|
| **Phase 1** | Runtime frontend + PocketBase backend scaffold. Claude Code as the vibe coding IDE. Output: GitHub template repo. | 🟡 Designing |

See [PHASE1.md](./PHASE1.md) for full task breakdown.

---

*Last updated: 2026-05-23 — Phase 1 added.*
