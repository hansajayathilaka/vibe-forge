# TASK-03 — PocketBase Backend Setup

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-01 |
| **Blocks** | TASK-07 |

---

## Description

Set up PocketBase as the backend. In Phase 1, PocketBase has two responsibilities:

1. **Serving app files** — via `--publicDir ../app`, it serves `app/screens/` and `app/behaviours/` as static HTTP files with zero configuration.
2. **Storing app data** — collections created by the developer's migrations (e.g. `posts`, `categories`) are the only tables in the database.

There are **no platform-level collections** in Phase 1. PocketBase is purely a data store and static file server.

### `scripts/setup.sh`

Must:
- Detect the host OS (macOS arm64, macOS amd64, Linux amd64, Linux arm64, Windows) and download the correct PocketBase binary from the GitHub releases to `backend/pocketbase`
- `chmod +x` the binary on Unix systems
- Copy any `app/hooks/*.pb.js` files into `backend/pb_hooks/` (include a comment at the top of each copied file noting that hook changes require a PocketBase restart)
- Print a success message with the next step (`pnpm dev`)

### `backend/pb_hooks/_example.pb.js`

An annotated example hook demonstrating the PocketBase JS hook pattern:

```javascript
// Example: log an audit event when a record's status changes
onRecordUpdate((e) => {
  const oldStatus = e.record.original().get('status')
  const newStatus = e.record.get('status')

  if (oldStatus !== newStatus) {
    // Create an audit_log record
    const collection = $app.findCollectionByNameOrId('audit_log')
    const log = new Record(collection)
    log.set('record_id', e.record.id)
    log.set('collection', e.record.collection().name)
    log.set('change', `status: ${oldStatus} → ${newStatus}`)
    $app.save(log)
  }
}, 'posts') // second arg scopes hook to the 'posts' collection
```

### `backend/pb_migrations/README.md`

Explains:
- All app schema migrations go here as Go files
- Naming convention: `<timestamp>_<description>.go` (e.g. `1716000000_create_posts.go`)
- Starter example showing how to create a collection with fields programmatically
- How to run migrations (they run automatically on PocketBase startup)
- Link to PocketBase Go migration docs

---

## Deliverables

- [ ] `scripts/setup.sh` (cross-platform binary download + hook copy)
- [ ] `backend/pb_hooks/_example.pb.js` (annotated example)
- [ ] `backend/pb_migrations/README.md` (with starter Go migration example)
- [ ] `pnpm dev` starts PocketBase and it serves files from `app/` at `http://localhost:8090`
