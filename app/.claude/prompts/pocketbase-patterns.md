# PocketBase Patterns Reference

Reference for Go migrations and PocketBase JS hooks in VibeForge. Used by `/gen-schema`, `/gen-workflow`, and the platform build tasks.

---

## Go Migrations

### File Location

```
backend/pb_migrations/<timestamp>_<name>.go
```

Use a Unix timestamp prefix for ordering: `1700000000_blog.go`

### File Structure

```go
package migrations

import (
    "github.com/pocketbase/pocketbase/core"
    m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
    m.Register(func(app core.App) error {
        // --- up migration ---
        collection := core.NewBaseCollection("posts")

        collection.Fields.Add(&core.TextField{
            Name:     "title",
            Required: true,
        })
        collection.Fields.Add(&core.TextField{
            Name: "body",
        })
        collection.Fields.Add(&core.SelectField{
            Name:   "status",
            Values: []string{"draft", "pending_review", "published"},
        })

        // API rules — empty string = public, nil = admin only
        collection.ListRule = ptrStr("status = 'published'")
        collection.ViewRule = ptrStr("status = 'published' || @request.auth.id != ''")
        collection.CreateRule = ptrStr("@request.auth.id != ''")
        collection.UpdateRule = ptrStr("@request.auth.id = author")
        collection.DeleteRule = ptrStr("@request.auth.id = author")

        return app.Save(collection)
    }, func(app core.App) error {
        // --- down migration ---
        collection, err := app.FindCollectionByNameOrId("posts")
        if err != nil {
            return err
        }
        return app.Delete(collection)
    })
}

func ptrStr(s string) *string { return &s }
```

### Field Types

| Field Struct | Use For | Key Config |
|---|---|---|
| `core.TextField` | Short text, slugs, names | `Required`, `Min`, `Max`, `Pattern` |
| `core.EditorField` | Long rich text | `Required`, `ConvertURLs` |
| `core.NumberField` | Integers and floats | `Required`, `Min`, `Max`, `OnlyInt` |
| `core.BoolField` | True/false flags | `Required` |
| `core.EmailField` | Email addresses | `Required`, `ExceptDomains`, `OnlyDomains` |
| `core.URLField` | URLs | `Required`, `ExceptDomains`, `OnlyDomains` |
| `core.DateField` | Dates and datetimes | `Required`, `Min`, `Max` |
| `core.SelectField` | Fixed-option enums | `Required`, `Values []string`, `MaxSelect` |
| `core.JSONField` | Arbitrary JSON | `Required`, `MaxSize` |
| `core.FileField` | File uploads | `Required`, `MaxSize`, `MaxSelect`, `MimeTypes` |
| `core.RelationField` | Foreign key to another collection | `Required`, `CollectionId`, `MaxSelect`, `CascadeDelete` |
| `core.AutodateField` | Auto-set created/updated | `OnCreate bool`, `OnUpdate bool` |

### API Rules

Rules are PocketBase filter expressions. `nil` means admin-only; empty string `""` means public.

```go
collection.ListRule   = nil              // admin only (list)
collection.ViewRule   = ptrStr("")       // anyone can view
collection.CreateRule = ptrStr("@request.auth.id != ''")  // must be authenticated
collection.UpdateRule = ptrStr("@request.auth.id = author")  // own records
collection.DeleteRule = ptrStr("@request.auth.isAdmin = true")  // admin only
```

Common rule patterns:

| Rule | Expression |
|---|---|
| Public | `ptrStr("")` |
| Authenticated | `ptrStr("@request.auth.id != ''")` |
| Own records | `ptrStr("@request.auth.id = owner")` (field must be relation to `_pb_users_auth_`) |
| Admin only | `nil` |
| Field filter | `ptrStr("status = 'published'")` |

### Relation Fields

```go
// RelationField linking posts → categories
categoryCollection, _ := app.FindCollectionByNameOrId("categories")
collection.Fields.Add(&core.RelationField{
    Name:         "category",
    CollectionId: categoryCollection.Id,
    MaxSelect:    1,  // single-select; 0 = unlimited
})
```

---

## PocketBase JS Hooks

### File Location

Hook files live in `app/hooks/` and are copied to `backend/pb_hooks/` by `pnpm setup`. After adding or changing a hook, re-run `pnpm setup` and restart PocketBase.

```
app/hooks/<name>.pb.js
```

### File Structure

```javascript
// app/hooks/post-status.pb.js
// Hook fires when a post record is updated.
// If status changed to pending_review, creates an audit_log entry.

onRecordUpdate((e) => {
    const oldStatus = e.record.original().get("status")
    const newStatus = e.record.get("status")

    if (newStatus === "pending_review" && oldStatus !== "pending_review") {
        const col = $app.findCollectionByNameOrId("audit_log")
        const log = new Record(col)
        log.set("record_id", e.record.id)
        log.set("collection", "posts")
        log.set("change", `status changed to pending_review from ${oldStatus}`)
        $app.save(log)
    }

    return e.next()
}, "posts")  // second arg = collection name filter (optional)
```

### Available Hook Functions

| Hook | Fires When |
|---|---|
| `onRecordCreate(fn, collection?)` | After a record is created |
| `onRecordUpdate(fn, collection?)` | After a record is updated |
| `onRecordDelete(fn, collection?)` | After a record is deleted |
| `onRecordBeforeCreate(fn, collection?)` | Before a record is created (can modify/reject) |
| `onRecordBeforeUpdate(fn, collection?)` | Before a record is updated (can modify/reject) |
| `onRecordBeforeDelete(fn, collection?)` | Before a record is deleted (can reject) |
| `onRecordRequest(fn, collection?)` | On any record API request |

### Hook Event API

```javascript
onRecordUpdate((e) => {
    e.record          // the Record being updated
    e.record.id       // record ID string
    e.record.get("fieldName")         // get current field value
    e.record.set("fieldName", value)  // set field value (before save)
    e.record.original().get("fieldName")  // get PRE-update value

    e.app             // same as $app — the app instance
    e.next()          // pass control to next handler (required to continue chain)
    return e.next()   // always return e.next() to avoid hanging
})
```

### Available Global APIs

```javascript
// Find a collection by name or ID
const col = $app.findCollectionByNameOrId("categories")

// Create and save a new record
const record = new Record(col)
record.set("name", "Technology")
record.set("slug", "technology")
$app.save(record)

// Find a record
const post = $app.findRecordById("posts", "RECORD_ID_HERE")

// Find records with filter
const records = $app.findRecordsByFilter(
    "posts",
    "status = 'published' && category = {:categoryId}",
    "-created",  // sort
    10,          // limit
    0,           // offset
    { categoryId: "some-id" }
)

// Delete a record
$app.delete(record)

// Send email (requires SMTP configured in PocketBase settings)
const message = new MailerMessage()
message.setFrom({ address: "noreply@example.com", name: "VibeForge" })
message.addTo({ address: "user@example.com" })
message.setSubject("New notification")
message.setHTML("<p>Hello!</p>")
$app.newMailClient().send(message)
```

### Common Patterns

#### Status Machine Transition Guard

Prevent invalid status transitions before save:

```javascript
onRecordBeforeUpdate((e) => {
    const oldStatus = e.record.original().get("status")
    const newStatus = e.record.get("status")

    const allowed = {
        draft: ["pending_review"],
        pending_review: ["published", "draft"],
        published: ["draft"],
    }

    if (oldStatus !== newStatus) {
        const validTransitions = allowed[oldStatus] ?? []
        if (!validTransitions.includes(newStatus)) {
            throw new Error(`Invalid status transition: ${oldStatus} → ${newStatus}`)
        }
    }

    return e.next()
}, "posts")
```

#### Create a Related Record on Save (Audit Log)

```javascript
onRecordUpdate((e) => {
    const col = $app.findCollectionByNameOrId("audit_log")
    const log = new Record(col)
    log.set("record_id", e.record.id)
    log.set("collection", "posts")
    log.set("change", JSON.stringify({
        field: "status",
        from: e.record.original().get("status"),
        to: e.record.get("status"),
    }))
    $app.save(log)
    return e.next()
}, "posts")
```

#### Computed Field Population Before Save

```javascript
onRecordBeforeCreate((e) => {
    const title = e.record.get("title") ?? ""
    const slug = title.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    e.record.set("slug", slug)
    return e.next()
}, "posts")
```

#### Send Email on Event

```javascript
onRecordCreate((e) => {
    const message = new MailerMessage()
    message.setFrom({ address: "noreply@myapp.com", name: "My App" })
    message.addTo({ address: e.record.get("email") })
    message.setSubject("Welcome!")
    message.setHTML(`<p>Welcome, ${e.record.get("name")}!</p>`)
    $app.newMailClient().send(message)
    return e.next()
}, "users")
```

---

## Running Migrations

PocketBase runs Go migrations automatically on startup when the `automigrate` plugin is registered in the main PocketBase binary. For this project, migrations are picked up automatically when PocketBase starts via `pnpm dev`.

To run migrations manually:
```bash
./backend/pocketbase migrate up
```

To rollback:
```bash
./backend/pocketbase migrate down 1
```
