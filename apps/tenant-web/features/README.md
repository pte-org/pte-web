# Features

One folder per feature, named after the matching `aptis-api` bounded context
(`iam`, `tenancy`, `questionbank`, `examoperations`, `examdelivery`, `scoring`)
or a frontend-only concern (e.g. `auth`).

Create a folder only when real work on that feature starts — don't pre-scaffold
all contexts up front. Mirror the structure of `auth/`:

```
features/<name>/
  components/
  hooks/
  api.ts      # calls via TanStack Query, types from @aptis/api-client
  types.ts
```
