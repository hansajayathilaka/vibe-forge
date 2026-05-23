# TASK-11 — Example Application (Blog)

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-06, TASK-07, TASK-08, TASK-09, TASK-10 |
| **Blocks** | TASK-12 |

---

## Description

Build a complete blog application on the scaffold to validate everything end-to-end. This proves the platform works and serves as the richest learning example for template users.

### PocketBase schema (`backend/pb_migrations/001_blog.go`)

Collections to create:

- **`categories`** — `name` (text, required), `slug` (text, unique)
- **`posts`** — `title` (text, required), `slug` (text, unique), `body` (text), `status` (select: `draft` / `pending_review` / `published`), `author` (relation → `_pb_users_auth_`), `category` (relation → `categories`)
- **`audit_log`** — `record_id` (text), `collection` (text), `change` (text), `created` (auto)

API rules:
- `posts`: anyone can list/view published posts; only authenticated users can create/update; only the author or admin can delete
- `categories`: public read, authenticated write
- `audit_log`: admin only

### Screen files (`app/screens/`)

| File | Route | Description |
|---|---|---|
| `_index.json` | — | Registry with all five screen entries |
| `home.json` | `/` | DataTable of published posts, filter by category using a Select bound to `/ui/categoryFilter`. Load call uses filter `status = 'published'`. On row click → navigate to `/posts/{id}`. |
| `post-detail.json` | `/posts/:id` | Get single post with `expand=author,category`. Show title (h1), badge for status, author name, category badge, body text. |
| `admin-posts.json` | `/admin/posts` | All posts table (no status filter). Status badge column. Row actions: edit button → navigate, delete button → openModal confirm. |
| `post-new.json` | `/admin/posts/new` | Create form. Title field triggers `slug-autogenerate` behaviour. Category select loads from `categories` list call. Submit → `callData` createPost → navigate to `/admin/posts`. |
| `post-edit.json` | `/admin/posts/:id/edit` | Load post via get call, populate form state from result. Same fields as post-new. Submit → `callData` updatePost → navigate back. |

### Behaviour files (`app/behaviours/`)

**`slug-autogenerate.js`**
```javascript
export function onTitleChange({ model }) {
  const title = model.get('/form/title') ?? ''
  const slug = title.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  model.set('/form/slug', slug)
}
```

**`confirm-delete.js`**
```javascript
export function onDeleteClick({ model }) {
  model.set('/ui/confirmDeleteOpen', true)
}

export function onConfirmDelete({ model, navigate }) {
  model.set('/ui/confirmDeleteOpen', false)
  // The actual delete callData action is chained in the spec after this
}
```

### Hook file (`app/hooks/`)

**`post-status.pb.js`** — on posts record update, if status changed to `pending_review`, create an `audit_log` record:

```javascript
onRecordUpdate((e) => {
  const oldStatus = e.record.original().get('status')
  const newStatus = e.record.get('status')
  if (newStatus === 'pending_review' && oldStatus !== 'pending_review') {
    const col = $app.findCollectionByNameOrId('audit_log')
    const log = new Record(col)
    log.set('record_id', e.record.id)
    log.set('collection', 'posts')
    log.set('change', `status changed to pending_review from ${oldStatus}`)
    $app.save(log)
  }
}, 'posts')
```

### End-to-end smoke test checklist

- [ ] Home screen loads and shows published posts list
- [ ] Clicking a post row navigates to post detail and shows correct data
- [ ] Admin posts list shows all posts with status badges
- [ ] New post form: slug auto-populates as title is typed
- [ ] New post form: category dropdown loads categories from PocketBase
- [ ] Saving a new post creates a record and redirects to admin list
- [ ] Edit post form: pre-populated with existing data
- [ ] Delete: confirm modal appears, cancelling does not delete, confirming does
- [ ] Changing a post status to `pending_review` creates an `audit_log` record

---

## Deliverables

- [ ] `backend/pb_migrations/001_blog.go`
- [ ] `app/screens/_index.json` (all five entries)
- [ ] `app/screens/home.json`
- [ ] `app/screens/post-detail.json`
- [ ] `app/screens/admin-posts.json`
- [ ] `app/screens/post-new.json`
- [ ] `app/screens/post-edit.json`
- [ ] `app/behaviours/slug-autogenerate.js`
- [ ] `app/behaviours/confirm-delete.js`
- [ ] `app/hooks/post-status.pb.js`
- [ ] All smoke test items above passing
