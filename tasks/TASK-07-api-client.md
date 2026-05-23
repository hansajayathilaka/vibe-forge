# TASK-07 — API Client & Data Binding Layer

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-03 |
| **Blocks** | TASK-05, TASK-11 |

---

## Description

Build the layer that connects `DataCall` definitions in screen JSON to PocketBase API operations, and writes results into the json-render `StateStore`.

### `PocketBaseClient` (`frontend/src/api/PocketBaseClient.ts`)

Wraps the `pocketbase` npm SDK as a singleton. Configured with `VITE_PB_URL`. Exposes typed methods:

```typescript
class PocketBaseClient {
  list(collection: string, options: ListOptions): Promise<ListResult>
  get(collection: string, id: string, options?: GetOptions): Promise<Record>
  create(collection: string, body: object): Promise<Record>
  update(collection: string, id: string, body: object): Promise<Record>
  delete(collection: string, id: string): Promise<void>
}

interface ListOptions {
  filter?: string
  sort?: string
  expand?: string
  page?: number
  perPage?: number
}
```

### `DataCallExecutor` (`frontend/src/api/DataCallExecutor.ts`)

Takes a `DataCall` definition and the current `StateStore`, resolves any state-dependent values, calls `PocketBaseClient`, and writes results back into the store.

```typescript
class DataCallExecutor {
  static async run(call: DataCall, store: StateStore): Promise<void> {
    store.set(`/data/${call.name}/_loading`, true)
    store.set(`/data/${call.name}/_error`, null)
    try {
      const result = await this.execute(call, store)
      this.writeResult(call, result, store)
    } catch (err) {
      store.set(`/data/${call.name}/_error`, err.message)
    } finally {
      store.set(`/data/${call.name}/_loading`, false)
    }
  }
}
```

**Resolving state-dependent values at call time:**
- `filter` — scan for `{/path}` patterns, replace with `store.get(path)`
- `id` — if value is `{ "$route": "paramName" }`, read `store.get('/route/params/paramName')`
- `body` — for each value in the body object, if it's a string starting with `/`, call `store.get(value)`

**Writing results:**
- `list` action → `store.set('/data/<name>/items', result.items)` + `store.set('/data/<name>/totalItems', result.totalItems)`
- `get` action → `store.set('/data/<name>', result)`
- `create` / `update` action → `store.set('/data/<name>', result)` (the saved record)
- `delete` → no data written, caller handles navigation

---

## Deliverables

- [ ] `frontend/src/api/PocketBaseClient.ts`
- [ ] `frontend/src/api/DataCallExecutor.ts`
