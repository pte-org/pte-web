# App Router layout

Route groups organize pages without affecting the URL:

```
app/
  layout.tsx       # root HTML shell, fonts, globals.css — shared by every route
  (dashboard)/     # authenticated app pages (root "/" lives here for now)
  (auth)/          # public auth pages (sign-in, sign-up) — add page.tsx here when auth work starts
```

Pages import their logic from the matching `features/<name>/` folder — `app/` stays
thin (route + layout composition only), business logic and API calls live in `features/`.

Auth gating currently happens client-side via `RequireAuth` (features/auth), which
redirects to `/login` when there is no token. A server-side `proxy.ts` (Next 16
renamed `middleware.ts` → `proxy.ts`) can enforce it earlier later. The
`(dashboard)`/`(auth)` route group names are organizational only.
