# TASK-02 — Catalog Definition & Screen Schema

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-01 |
| **Blocks** | TASK-05, TASK-10 |

---

## Description

Define the platform's component catalog using `defineCatalog` from `@json-render/core`, and produce the JSON Schema for the outer screen wrapper. This task establishes the contract between Claude Code (what it can generate) and the renderer (what it can render).

### Catalog (`frontend/src/catalog/index.ts`)

Use `defineCatalog` with Zod prop schemas for every component in the catalog. Include a `description` on each — this is what `catalog.prompt()` uses to tell Claude Code when to use the component. Register all platform actions (`callData`, `navigate`, `runBehaviour`) with Zod param schemas and descriptions.

```typescript
import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/react/schema'
import { z } from 'zod'

export const catalog = defineCatalog(schema, {
  components: {
    Column: {
      props: z.object({
        gap: z.number().nullable(),
        padding: z.number().nullable(),
        align: z.string().nullable(),
      }),
      slots: ['default'],
      description: 'Vertical stack of elements. Use as a page or section container.',
    },
    TextField: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
        required: z.boolean().nullable(),
        type: z.string().nullable(),
      }),
      description: 'Single-line text input. Bind value with $bindState.',
    },
    // ... all components
  },
  actions: {
    callData: {
      params: z.object({ name: z.string() }),
      description: 'Trigger a named PocketBase data call defined in the screen data array.',
    },
    navigate: {
      params: z.object({ to: z.string() }),
      description: 'Navigate to a route. Use $template syntax for dynamic paths.',
    },
    runBehaviour: {
      params: z.object({ file: z.string(), fn: z.string() }),
      description: 'Call a named export from a JS behaviour file in app/behaviours/.',
    },
  },
})
```

### Full component catalog to implement

| Component | Key Props | Slots | Notes |
|---|---|---|---|
| `Column` | `gap` `padding` `align` | `default` | Vertical flex container |
| `Row` | `gap` `padding` `align` `wrap` | `default` | Horizontal flex |
| `Grid` | `cols` `gap` | `default` | CSS grid |
| `Card` | `padding` | `default` | Surface card |
| `Text` | `text` `variant` (h1–h6, body, caption) `color` | — | Literal or `$state` bound |
| `Button` | `label` `variant` (primary/secondary/danger/ghost) `disabled` `loading` | — | Fires `action` on click |
| `Link` | `label` `to` `external` | — | React Router or `<a>` |
| `Image` | `src` `alt` `width` `height` | — | |
| `Divider` | — | — | |
| `Badge` | `label` `color` (green/yellow/red/blue/gray) | — | |
| `Spacer` | `size` | — | |
| `DataTable` | `columns` `emptyMessage` | — | Uses `repeat` for rows |
| `Form` | — | `default` | Fires `submit` action |
| `TextField` | `label` `placeholder` `required` `type` | — | Use `$bindState` on `value` |
| `TextArea` | `label` `rows` | — | Use `$bindState` on `value` |
| `Select` | `label` `options` | — | `$bindState` on `value`; `$state` on `options` |
| `Checkbox` | `label` | — | `$bindState` on `checked` |
| `Modal` | `title` | `default` | Visibility via `showIf` |
| `Tabs` | `tabs` | named per tab id | `$bindState` on active tab |

### Screen wrapper JSON Schema (`shared/schemas/ui-screen.schema.json`)

JSON Schema draft-07 for the outer screen file fields only: `id`, `title`, `route`, `data` (array of DataCall), and `spec` (typed as `object` — json-render validates internally). Enables `$schema` autocomplete in editors.

### TypeScript types (`shared/types/ui-screen.ts`)

`UiScreen` and `DataCall` types matching the screen wrapper schema. The `spec` field typed as `JsonRenderSpec` from `@json-render/core`.

### Prompt reference (`.claude/prompts/ui-json-spec.md`)

Human-readable reference built on top of `catalog.prompt()` output. Must document:
- Screen wrapper format (`id`, `title`, `route`, `data`, `spec`)
- DataCall syntax and all fields
- State namespaces at runtime (`/form/`, `/data/<name>/`, `/route/params/`)
- All data binding expressions (`$state`, `$bindState`, `$item`, `$template`, `$cond`)
- Platform actions (`callData`, `navigate`, `runBehaviour`)
- Full annotated screen example (the post-form example from PHASE1.md)

---

## Deliverables

- [ ] `frontend/src/catalog/index.ts` — full catalog with all components and actions
- [ ] `shared/schemas/ui-screen.schema.json`
- [ ] `shared/types/ui-screen.ts`
- [ ] `.claude/prompts/ui-json-spec.md`
