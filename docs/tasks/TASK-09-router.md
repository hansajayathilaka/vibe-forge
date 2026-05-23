# TASK-09 — Router

| Field | Value |
|---|---|
| **Phase** | Phase 1 |
| **Status** | `pending` |
| **Blocked by** | TASK-04, TASK-05 |
| **Blocks** | TASK-11 |

---

## Description

Build the routing layer. Routes are derived at app startup from `_index.json`, not hard-coded in the application.

### `AppRouter` (`frontend/src/router/AppRouter.tsx`)

On mount, calls `configSource.listScreens()` to get all `ScreenMeta[]`. Builds a React Router `<Routes>` tree dynamically:

```tsx
function AppRouter() {
  const [screens, setScreens] = useState<ScreenMeta[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    configSource.listScreens()
      .then(setScreens)
      .catch(setError)
  }, [])

  if (!screens) return <FullPageSpinner />
  if (error) return <FullPageError error={error} />

  return (
    <Routes>
      {screens.map(meta => (
        <Route
          key={meta.id}
          path={meta.route}
          element={<ScreenRenderer screenId={meta.id} />}
        />
      ))}
      <Route path="*" element={<ScreenRenderer screenId="_404" />} />
    </Routes>
  )
}
```

### Route params → store

React Router's `:param` segments are extracted by `ScreenRenderer` using `useParams()` and injected into the state store at `/route/params/<name>` before any data calls fire. See TASK-05.

### Special screen IDs

| ID | Behaviour |
|---|---|
| `_404` | Rendered for any unmatched route. Falls back to a built-in "Page not found" component if no `_404.json` exists in `app/screens/`. |
| `_home` | Optional alias — if no screen has `"route": "/"`, the router renders the screen with id `_home` at `/` as a fallback. |

### `FullPageSpinner` and `FullPageError`

Two small utility components used during the screen index fetch. These are platform UI, not catalog components — they live in `frontend/src/router/` alongside `AppRouter.tsx`.

---

## Deliverables

- [ ] `frontend/src/router/AppRouter.tsx`
- [ ] `frontend/src/router/FullPageSpinner.tsx`
- [ ] `frontend/src/router/FullPageError.tsx`
- [ ] `frontend/src/main.tsx` — app entry point wrapping `<BrowserRouter><AppRouter /></BrowserRouter>`
