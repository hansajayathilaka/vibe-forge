# VibeForge Component Catalog

Auto-generated reference for all components and actions available in screen JSON files.

## Custom Rules

- Always include a $schema reference at the top of the screen file.
- Always define data calls in the screen `data` array, not inline in elements.
- Use Column as the root element for all screens.
- Use descriptive element IDs like "post-title-field" not "field1".
- Every component accepts an optional `className` prop (string) to append Tailwind utility classes to its root element.

---

## Components

### Column

Vertical stack of elements. Use as page or section container. Children stack top-to-bottom.

Accepts children: **yes**

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `gap` | number | null | optional |
| `padding` | number | null | optional |
| `align` | "start" | "center" | "end" | "stretch" | null | optional |

### Row

Horizontal flex container. Children lay out side-by-side. Set wrap:true to allow wrapping.

Accepts children: **yes**

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `gap` | number | null | optional |
| `padding` | number | null | optional |
| `align` | "start" | "center" | "end" | "stretch" | null | optional |
| `wrap` | boolean | null | optional |

### Grid

CSS grid container. cols sets the column count. Use gap for spacing.

Accepts children: **yes**

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `cols` | number | null | optional |
| `gap` | number | null | optional |

### Card

Surface card with border and shadow. Use as a content container.

Accepts children: **yes**

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `padding` | number | null | optional |

### Text

Renders a heading or paragraph. text can be a literal string or $state bound. variant: h1–h6 | body | caption.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `text` | any | required |
| `variant` | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "caption" | null | optional |
| `color` | string | null | optional |

### Badge

Coloured label chip. label can be $state bound. color: green | yellow | red | blue | gray.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `label` | any | required |
| `color` | "green" | "yellow" | "red" | "blue" | "gray" | null | optional |

### Image

Image element. src can be $state bound.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `src` | any | required |
| `alt` | string | required |
| `width` | number | optional |
| `height` | number | optional |

### Divider

Horizontal rule divider.

### Spacer

Empty vertical/horizontal space. size is a Tailwind spacing unit (4 = 1 rem).

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `size` | number | optional |

### TextField

Single-line text input. Bind value with $bindState. Fires change action on input.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `label` | string | required |
| `value` | any | optional |
| `placeholder` | string | null | optional |
| `required` | boolean | null | optional |
| `type` | "text" | "email" | "password" | "number" | "tel" | "url" | null | optional |

### TextArea

Multi-line text input. Bind value with $bindState.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `label` | string | required |
| `value` | any | optional |
| `rows` | number | optional |

### Select

Dropdown select. Bind value with $bindState. options can be a literal array [{value,label}] or $state bound to a list DataCall result.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `label` | string | required |
| `value` | any | optional |
| `options` | any | required |

### Checkbox

Boolean toggle checkbox. Bind checked with $bindState.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `label` | string | required |
| `checked` | any | optional |

### Button

Clickable button. Fires click action. variant: primary | secondary | danger | ghost. loading can be $state bound to a data call _loading flag.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `label` | string | required |
| `variant` | "primary" | "secondary" | "danger" | "ghost" | null | optional |
| `disabled` | any | optional |
| `loading` | any | optional |

### Link

Navigation link. Use to for a React Router path. Set external:true for an <a> link to an external URL.

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `label` | string | required |
| `to` | string | required |
| `external` | boolean | null | optional |

### Form

Wraps form fields. Fires submit action on form submission. Children should be input components and a submit Button.

Accepts children: **yes**

### DataTable

Table with column headers. Use repeat to iterate over data rows. Fires rowClick action when a row is clicked. columns: [{key, label, format?}].

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `columns` | object[] | required |
| `emptyMessage` | string | optional |

### Modal

Dialog overlay. Control visibility with showIf bound to a UI state flag (e.g. /ui/confirmOpen). Children are the modal body.

Accepts children: **yes**

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `title` | string | required |

### Tabs

Tabbed content. tabs is an array of {id, label}. Bind activeTab with $bindState to /ui/activeTab. Children are named per tab id.

Accepts children: **yes**

**Props:**

| Prop | Type | Notes |
|------|------|-------|
| `tabs` | object[] | required |
| `activeTab` | any | optional |

---

## Actions

### callData

Trigger a named PocketBase data call defined in the screen data array. name must match a DataCall name.

**Params:**

| Param | Type |
|-------|------|
| `name` | string |

### navigate

Navigate to a route. to supports $template interpolation, e.g. "/posts/${/route/params/id}".

**Params:**

| Param | Type |
|-------|------|
| `to` | string |

### runBehaviour

Call named export fn from app/behaviours/<file>.js. The function receives a BehaviourContext with store, pb, and route.

**Params:**

| Param | Type |
|-------|------|
| `file` | string |
| `fn` | string |
