import { createCatalog } from '@json-render/core'
import { z } from 'zod'

export const catalog = createCatalog({
  name: 'vibeforge',
  components: {
    // ── Layout ─────────────────────────────────────────────────────────────
    Column: {
      props: z.object({
        gap: z.number().nullable().optional(),
        padding: z.number().nullable().optional(),
        align: z.enum(['start', 'center', 'end', 'stretch']).nullable().optional(),
      }),
      hasChildren: true,
      description:
        'Vertical stack of elements. Use as page or section container. Children stack top-to-bottom.',
    },
    Row: {
      props: z.object({
        gap: z.number().nullable().optional(),
        padding: z.number().nullable().optional(),
        align: z.enum(['start', 'center', 'end', 'stretch']).nullable().optional(),
        wrap: z.boolean().nullable().optional(),
      }),
      hasChildren: true,
      description:
        'Horizontal flex container. Children lay out side-by-side. Set wrap:true to allow wrapping.',
    },
    Grid: {
      props: z.object({
        cols: z.number().nullable().optional(),
        gap: z.number().nullable().optional(),
      }),
      hasChildren: true,
      description: 'CSS grid container. cols sets the column count. Use gap for spacing.',
    },
    Card: {
      props: z.object({
        padding: z.number().nullable().optional(),
      }),
      hasChildren: true,
      description: 'Surface card with border and shadow. Use as a content container.',
    },

    // ── Display ────────────────────────────────────────────────────────────
    Text: {
      props: z.object({
        text: z.unknown(),
        variant: z
          .enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'caption'])
          .nullable()
          .optional(),
        color: z.string().nullable().optional(),
      }),
      description:
        'Renders a heading or paragraph. text can be a literal string or $state bound. variant: h1–h6 | body | caption.',
    },
    Badge: {
      props: z.object({
        label: z.unknown(),
        color: z.enum(['green', 'yellow', 'red', 'blue', 'gray']).nullable().optional(),
      }),
      description:
        'Coloured label chip. label can be $state bound. color: green | yellow | red | blue | gray.',
    },
    Image: {
      props: z.object({
        src: z.unknown(),
        alt: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
      description: 'Image element. src can be $state bound.',
    },
    Divider: {
      props: z.object({}),
      description: 'Horizontal rule divider.',
    },
    Spacer: {
      props: z.object({
        size: z.number().optional(),
      }),
      description: 'Empty vertical/horizontal space. size is a Tailwind spacing unit (4 = 1 rem).',
    },

    // ── Inputs ─────────────────────────────────────────────────────────────
    TextField: {
      props: z.object({
        label: z.string(),
        value: z.unknown().optional(),
        placeholder: z.string().nullable().optional(),
        required: z.boolean().nullable().optional(),
        type: z
          .enum(['text', 'email', 'password', 'number', 'tel', 'url'])
          .nullable()
          .optional(),
      }),
      description:
        'Single-line text input. Bind value with $bindState. Fires change action on input.',
    },
    TextArea: {
      props: z.object({
        label: z.string(),
        value: z.unknown().optional(),
        rows: z.number().optional(),
      }),
      description: 'Multi-line text input. Bind value with $bindState.',
    },
    Select: {
      props: z.object({
        label: z.string(),
        value: z.unknown().optional(),
        options: z.unknown(),
      }),
      description:
        'Dropdown select. Bind value with $bindState. options can be a literal array [{value,label}] or $state bound to a list DataCall result.',
    },
    Checkbox: {
      props: z.object({
        label: z.string(),
        checked: z.unknown().optional(),
      }),
      description: 'Boolean toggle checkbox. Bind checked with $bindState.',
    },

    // ── Composite ──────────────────────────────────────────────────────────
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['primary', 'secondary', 'danger', 'ghost']).nullable().optional(),
        disabled: z.unknown().optional(),
        loading: z.unknown().optional(),
      }),
      description:
        'Clickable button. Fires click action. variant: primary | secondary | danger | ghost. loading can be $state bound to a data call _loading flag.',
    },
    Link: {
      props: z.object({
        label: z.string(),
        to: z.string(),
        external: z.boolean().nullable().optional(),
      }),
      description:
        'Navigation link. Use to for a React Router path. Set external:true for an <a> link to an external URL.',
    },
    Form: {
      props: z.object({}),
      hasChildren: true,
      description:
        'Wraps form fields. Fires submit action on form submission. Children should be input components and a submit Button.',
    },
    DataTable: {
      props: z.object({
        columns: z.array(
          z.object({
            key: z.string(),
            label: z.string(),
            format: z.string().optional(),
          }),
        ),
        emptyMessage: z.string().optional(),
      }),
      description:
        'Table with column headers. Use repeat to iterate over data rows. Fires rowClick action when a row is clicked. columns: [{key, label, format?}].',
    },
    Modal: {
      props: z.object({
        title: z.string(),
      }),
      hasChildren: true,
      description:
        'Dialog overlay. Control visibility with showIf bound to a UI state flag (e.g. /ui/confirmOpen). Children are the modal body.',
    },
    Tabs: {
      props: z.object({
        tabs: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
          }),
        ),
        activeTab: z.unknown().optional(),
      }),
      hasChildren: true,
      description:
        'Tabbed content. tabs is an array of {id, label}. Bind activeTab with $bindState to /ui/activeTab. Children are named per tab id.',
    },
  },

  actions: {
    callData: {
      params: z.object({ name: z.string() }),
      description:
        'Trigger a named PocketBase data call defined in the screen data array. name must match a DataCall name.',
    },
    navigate: {
      params: z.object({ to: z.string() }),
      description:
        'Navigate to a route. to supports $template interpolation, e.g. "/posts/${/route/params/id}".',
    },
    runBehaviour: {
      params: z.object({ file: z.string(), fn: z.string() }),
      description:
        'Call named export fn from app/behaviours/<file>.js. The function receives a BehaviourContext with store, pb, and route.',
    },
  },
})

export type AppCatalog = typeof catalog
