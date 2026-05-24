package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// --- categories ---
		categories := core.NewBaseCollection("categories")
		categories.Fields.Add(&core.TextField{
			Name:     "name",
			Required: true,
		})
		categories.Fields.Add(&core.TextField{
			Name: "slug",
		})
		categories.ListRule   = ptrStr("")
		categories.ViewRule   = ptrStr("")
		categories.CreateRule = ptrStr("@request.auth.id != ''")
		categories.UpdateRule = ptrStr("@request.auth.id != ''")
		categories.DeleteRule = ptrStr("@request.auth.id != ''")
		if err := app.Save(categories); err != nil {
			return err
		}

		// --- posts ---
		posts := core.NewBaseCollection("posts")
		posts.Fields.Add(&core.TextField{
			Name:     "title",
			Required: true,
		})
		posts.Fields.Add(&core.TextField{
			Name: "slug",
		})
		posts.Fields.Add(&core.TextField{
			Name: "body",
		})
		posts.Fields.Add(&core.SelectField{
			Name:   "status",
			Values: []string{"draft", "pending_review", "published"},
		})

		usersCollection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}
		posts.Fields.Add(&core.RelationField{
			Name:         "author",
			CollectionId: usersCollection.Id,
			MaxSelect:    1,
		})
		posts.Fields.Add(&core.RelationField{
			Name:         "category",
			CollectionId: categories.Id,
			MaxSelect:    1,
		})

		posts.ListRule   = ptrStr("status = 'published'")
		posts.ViewRule   = ptrStr("status = 'published' || @request.auth.id != ''")
		posts.CreateRule = ptrStr("@request.auth.id != ''")
		posts.UpdateRule = ptrStr("@request.auth.id != ''")
		posts.DeleteRule = ptrStr("@request.auth.id = author")
		if err := app.Save(posts); err != nil {
			return err
		}

		// --- audit_log ---
		// PocketBase automatically adds 'created' and 'updated' auto-date fields.
		auditLog := core.NewBaseCollection("audit_log")
		auditLog.Fields.Add(&core.TextField{
			Name: "record_id",
		})
		auditLog.Fields.Add(&core.TextField{
			Name: "collection",
		})
		auditLog.Fields.Add(&core.TextField{
			Name: "change",
		})
		auditLog.ListRule   = nil
		auditLog.ViewRule   = nil
		auditLog.CreateRule = nil
		auditLog.UpdateRule = nil
		auditLog.DeleteRule = nil
		return app.Save(auditLog)
	}, func(app core.App) error {
		for _, name := range []string{"audit_log", "posts", "categories"} {
			col, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				return err
			}
			if err := app.Delete(col); err != nil {
				return err
			}
		}
		return nil
	})
}

func ptrStr(s string) *string { return &s }
