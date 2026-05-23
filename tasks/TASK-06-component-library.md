# TASK-06 — Base Component Library

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-05 |
| **Blocks** | TASK-11 |

---

## Description

Build the React components that back the catalog. `@json-render/react` resolves all `$state`, `$bindState`, `$item` expressions before calling the components, so components receive plain resolved values. They are plain React + Tailwind — no expression handling, no internal state management.

### Key implementation rules

**`$bindState` two-way binding** — json-render passes an `onChange` callback alongside the resolved value for any prop declared with `$bindState`. The component just calls `onChange(newValue)` — the library writes back to the store automatically.

**`DataTable`** — use json-render's `repeat` field on a row element in the spec, not list logic inside the component. `DataTable` receives a `columns` prop and renders the column headers; a separate `DataTableRow` (or the component used as the repeat template) renders one row per item. The component itself doesn't iterate.

**`Form`** — receives an `onSubmit` prop wired by the library from the catalog action. Just attach it to `<form onSubmit={e => { e.preventDefault(); onSubmit() }}>`.

**`Modal`** — visibility is controlled by `showIf` in the spec, not internal state. The component is always mounted; the library shows/hides it. Use a React portal.

**`Select` options** — arrive as a pre-resolved array `[{ label: string, value: string }]`. The library has already resolved `{ "$state": "..." }` before calling the component.

**`Tabs`** — active tab is stored in the spec state and bound via `$bindState`. The component receives `activeTab: string` and `onTabChange: (id: string) => void`.

### Components to build

| Component | File | Notes |
|---|---|---|
| `Column` | `Column.tsx` | `div` with `flex flex-col`, gap/padding from Tailwind scale |
| `Row` | `Row.tsx` | `div` with `flex flex-row` |
| `Grid` | `Grid.tsx` | `div` with CSS grid, `cols` → `grid-cols-{n}` |
| `Card` | `Card.tsx` | `div` with border, rounded, shadow, optional padding |
| `Text` | `Text.tsx` | Renders h1–h6 or `<p>` based on `variant` |
| `Button` | `Button.tsx` | Styled button, `loading` shows spinner, `disabled` dims |
| `Link` | `Link.tsx` | React Router `<Link>` or `<a target="_blank">` |
| `Image` | `Image.tsx` | `<img>` with fallback on error |
| `Divider` | `Divider.tsx` | `<hr>` with optional label |
| `Badge` | `Badge.tsx` | Pill-shaped `<span>` with colour variants |
| `Spacer` | `Spacer.tsx` | Empty `<div>` with height/width |
| `DataTable` | `DataTable.tsx` + `DataTableRow.tsx` | Table with sortable column headers |
| `Form` | `Form.tsx` | `<form>` wrapper, calls `onSubmit` action |
| `TextField` | `TextField.tsx` | `<input>` with label, error state |
| `TextArea` | `TextArea.tsx` | `<textarea>` with label |
| `Select` | `Select.tsx` | `<select>` with label, renders options array |
| `Checkbox` | `Checkbox.tsx` | `<input type="checkbox">` with label |
| `Modal` | `Modal.tsx` | React portal, backdrop, close on Escape |
| `Tabs` | `Tabs.tsx` | Tab bar + slot rendering |

### Tailwind conventions

- Spacing: use Tailwind's numeric scale (`gap-4`, `p-6`, etc.) mapping `gap` prop number → `gap-{n}`
- Colours for Badge and Button: define a fixed map (`green → bg-green-100 text-green-800`, etc.)
- No arbitrary values (`[...]`) — only core utilities

---

## Deliverables

- [ ] `frontend/src/components/<ComponentName>.tsx` for every component above
- [ ] `frontend/src/components/index.ts` — barrel export of all components
- [ ] All components imported and registered in `frontend/src/renderer/registry.ts`
