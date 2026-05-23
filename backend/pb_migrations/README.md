# PocketBase Migrations

All app schema migrations go here as Go files. PocketBase runs them automatically on startup.

## Naming convention

```
<unix-timestamp>_<description>.go
```

Examples:
- `1716000000_create_posts.go`
- `1716000001_create_categories.go`

Use a Unix timestamp prefix so migrations run in the correct order.

## How migrations run

Migrations are picked up automatically when PocketBase starts via `pnpm dev`. You do not need to run any command manually.

To run or roll back migrations manually:

```bash
# Apply all pending migrations
./backend/pocketbase migrate up

# Roll back the most recent migration
./backend/pocketbase migrate down 1
```

## Starter example

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
            Name: "slug",
        })
        collection.Fields.Add(&core.EditorField{
            Name: "body",
        })
        collection.Fields.Add(&core.SelectField{
            Name:   "status",
            Values: []string{"draft", "pending_review", "published"},
        })

        // API rules — empty string = public, nil = admin only
        collection.ListRule  = ptrStr("status = 'published'")
        collection.ViewRule  = ptrStr("status = 'published' || @request.auth.id != ''")
        collection.CreateRule = ptrStr("@request.auth.id != ''")
        collection.UpdateRule = ptrStr("@request.auth.id != ''")
        collection.DeleteRule = ptrStr("@request.auth.id != ''")

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

## Further reading

- [PocketBase Go migrations docs](https://pocketbase.io/docs/go-migrations/)
- [PocketBase collections API](https://pocketbase.io/docs/go-collections-api/)
- [Field types reference](https://pocketbase.io/docs/go-record-operations/)
