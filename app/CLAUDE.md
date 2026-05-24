# VibeForge — Vibe Coder Context

VibeForge is a low-code platform where you build data-driven applications by describing screens, behaviours, and data schemas in plain language — Claude Code generates the files, and the platform renders them at runtime.

## Your Workspace

This `app/` directory is your entire working area:

| Directory | What it holds |
|-----------|--------------|
| `app/screens/` | Screen JSON files — each file defines one screen's UI and data calls |
| `app/screens/_index.json` | Screen registry — every screen must have an entry here |
| `app/behaviours/` | Behaviour JS files — interactive logic loaded at runtime |
| `app/hooks/` | PocketBase workflow hooks — server-side event handlers |

The platform runtime in `frontend/` and PocketBase in `backend/` are infrastructure — you rarely need to touch them.

## How Screens Work

A screen is a JSON file in `app/screens/<name>.json`. It declares:
- **data calls** — PocketBase queries the screen runs (list, get, create, update, delete)
- **spec** — a tree of UI components using the catalog: `Column`, `TextField`, `Button`, `DataTable`, etc.

Every screen must be registered in `app/screens/_index.json`. PocketBase serves these files statically; the frontend renderer fetches and renders them at runtime.

Run `/gen-screen` to generate a new screen from a plain-language description.

## How Behaviour Files Work

A behaviour file is a plain ES module at `app/behaviours/<name>.js`. It exports named functions that receive a `{ model, navigate }` context:

```javascript
export function onTitleChange({ model }) {
  const title = model.get('/form/title') ?? ''
  model.set('/form/slug', title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
}
```

- `model.get('/path')` — read state (JSON Pointer paths)
- `model.set('/path', value)` — write state
- `navigate('/route')` — navigate to a route

Wire a behaviour to an element event using `runBehaviour` in the screen spec. Run `/gen-behaviour` to generate a behaviour file from a description.

## How to Add a Collection

Go migrations in `backend/pb_migrations/` define your PocketBase collections. PocketBase picks them up automatically on next start.

Run `/gen-schema` to generate a migration from an entity description like "a product with name, price, stock count, and category".

## How to Style Your App

### Global brand theme

Edit `app/styles/theme.css`. Uncomment and change the CSS variables that correspond to your brand:

```css
:root {
  --vf-color-primary: #7c3aed;        /* purple primary */
  --vf-color-primary-hover: #6d28d9;
  --vf-color-surface: #1e1e2e;        /* dark surface */
  --vf-radius: 0.75rem;               /* rounder corners */
}
```

Changes take effect on the next page load — no rebuild required. The platform defaults (blue, white, 0.5rem radius) apply for any variable you leave commented out.

Run `/gen-theme` to have Claude choose hex values from a plain-language brand description.

### Per-element custom classes

Every element in a screen JSON accepts an optional `className` prop. It appends Tailwind utility classes to the component's root DOM element without replacing its base styles:

```json
{
  "id": "save-btn",
  "type": "Button",
  "props": { "label": "Save", "variant": "primary", "className": "w-full mt-4" }
}
```

## How to Add a Workflow Hook

Create a `.pb.js` file in `app/hooks/<name>.pb.js`, then run `pnpm setup` from the repo root and restart PocketBase. Hooks fire on PocketBase record events.

Run `/gen-workflow` to generate a hook from a description like "when a post status changes to pending_review, log it to audit_log".

## Slash Commands

| Command | What it does |
|---------|-------------|
| `/gen-screen` | Generate a screen JSON file + `_index.json` entry from a description |
| `/gen-behaviour` | Generate a behaviour JS file from an interaction description |
| `/gen-schema` | Generate a PocketBase Go migration from an entity description |
| `/gen-workflow` | Generate a PocketBase JS hook from a workflow description |
| `/gen-theme` | Set brand colours and radius from a plain-language description |

## Spec Reference Files

These are automatically read by the slash commands above:

- `.claude/prompts/ui-json-spec.md` — full screen JSON format, DataCall spec, state binding expressions, component catalog
- `.claude/prompts/behaviour-file-spec.md` — behaviour file contract, BehaviourContext, common patterns
- `.claude/prompts/pocketbase-patterns.md` — Go migration structure, field types, API rules, JS hook patterns
- `.claude/prompts/catalog-prompt.md` — auto-generated component reference

## Quick-Start Recipes

**New screen:**
> Add a new screen for [what it shows and what users can do]. Use /gen-screen.

**New PocketBase collection:**
> Add a PocketBase collection for [entity, its fields, who can access it]. Use /gen-schema.

**New behaviour:**
> Add a behaviour that [what interaction it handles, what state it reads/writes]. Use /gen-behaviour.

**New workflow hook:**
> Add a workflow hook that [trigger event and what the hook should do]. Use /gen-workflow.

**Brand theme:**
> Apply a [colour/style description, e.g. "deep purple with rounded corners and dark card surfaces"] theme. Use /gen-theme.
