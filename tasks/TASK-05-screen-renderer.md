# TASK-05 — ScreenRenderer

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-02, TASK-04 |
| **Blocks** | TASK-06, TASK-09 |

---

## Description

The rendering engine itself is `@json-render/react`. Our job is to build the `ScreenRenderer` that sits above it: fetches the screen, initialises the state store with PocketBase data and route params, then hands the spec to the library.

### `ScreenRenderer` flow

1. Receives a `screenId` prop from the router
2. Fetches `UiScreen` via `configSource.getScreen(screenId)`
3. Creates a `StateStore` via `createStateStore(screen.spec.state ?? {})`
4. Injects route params into the store: `store.set('/route/params/<name>', value)` for each param from React Router's `useParams()`
5. Fires all `trigger: "load"` DataCalls in parallel via `triggerDataCall`; each result is written into the store:
   - List → `store.set('/data/<name>/items', records)` + `store.set('/data/<name>/totalItems', n)`
   - Single record → `store.set('/data/<name>', record)`
   - Loading flag → `store.set('/data/<name>/_loading', true/false)`
   - Error → `store.set('/data/<name>/_error', message ?? null)`
6. Renders:

```tsx
<StateProvider store={store}>
  <VisibilityProvider>
    <Renderer spec={screen.spec} registry={registry} />
  </VisibilityProvider>
</StateProvider>
```

Shows a loading skeleton while the screen JSON is being fetched. Shows a full-page error boundary if fetch fails.

### `registry.ts`

Maps catalog component type strings to React components and wires platform action handlers:

```typescript
import { Column, Row, Grid, Card, Text, Button, Link, Image,
         Divider, Badge, Spacer, DataTable, Form, TextField,
         TextArea, Select, Checkbox, Modal, Tabs } from '../components'
import { triggerDataCall } from './triggerDataCall'
import { loadBehaviour } from '../behaviour/BehaviourLoader'

export const registry = {
  components: {
    Column, Row, Grid, Card, Text, Button, Link, Image,
    Divider, Badge, Spacer, DataTable, Form, TextField,
    TextArea, Select, Checkbox, Modal, Tabs,
  },
  actions: {
    callData: ({ params, store, screenData }) => {
      triggerDataCall(params.name, store, screenData)
    },
    navigate: ({ params, store }) => {
      // interpolate ${/path} in params.to using store values
      const to = interpolateTemplate(params.to, store)
      router.navigate(to)
    },
    runBehaviour: async ({ params, store }) => {
      const mod = await loadBehaviour(params.file)
      mod[params.fn]({
        model: { get: store.get, set: store.set },
        navigate: router.navigate,
      })
    },
  },
}
```

### `triggerDataCall.ts`

```typescript
export async function triggerDataCall(
  name: string,
  store: StateStore,
  dataCalls: DataCall[]
): Promise<void> {
  const call = dataCalls.find(d => d.name === name)
  if (!call) throw new Error(`DataCall "${name}" not found`)
  await DataCallExecutor.run(call, store)
}
```

Called both at screen mount (for `trigger: "load"` calls fired in parallel) and by the `callData` action handler in the registry.

---

## Deliverables

- [ ] `frontend/src/renderer/ScreenRenderer.tsx`
- [ ] `frontend/src/renderer/registry.ts`
- [ ] `frontend/src/renderer/triggerDataCall.ts`
- [ ] `frontend/src/renderer/interpolateTemplate.ts` (resolves `${/path}` in strings using the store)
