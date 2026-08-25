# pte-web

Frontend monorepo for PTE LMS — pnpm workspaces + Turborepo. Two independent
Next.js apps (Tenant Portal, Vendor Portal) sharing UI, config, and API-client
packages. Calls the `pte-api` (Spring Boot) backend; does not talk to a
database directly.

> Web only. The exam-taking client (`pte-app`, Flutter) is a separate repo —
> not part of this workspace.

## Getting Started

```bash
pnpm install
pnpm dev                          # runs both apps (turbo dev)
pnpm dev --filter tenant-web      # run only one app
pnpm dev --filter vendor-web
pnpm lint                         # lint all apps/packages
pnpm build                        # build all apps/packages
```

## Directory Structure

```
pte-web/
├── apps/
│   ├── tenant-web/        # Tenant Portal — Admin/Teacher/Student-facing app
│   └── vendor-web/        # Vendor Portal — superadmin-facing app (cross-tenant)
├── packages/
│   ├── ui/                 # Shared React components, no business logic
│   ├── config/             # Shared eslint + tsconfig, consumed via package exports
│   └── api-client/         # Hand-written types + request functions for pte-api
├── pnpm-workspace.yaml      # Workspace package globs + build-script allowlist
├── turbo.json               # Task pipeline (dev/build/lint/test) across packages
└── package.json              # Root scripts only (turbo dev/build/lint); no app code here
```

### `apps/<tenant-web|vendor-web>/`

Each app is a standalone Next.js (App Router) project. Same dependency versions,
same conventions, **no imports between the two apps** — anything shared goes
through `packages/*`.

```
apps/<app>/
├── app/
│   ├── layout.tsx        # Root HTML shell: fonts, <html>/<body>, imports globals.css
│   ├── globals.css       # Tailwind v4 entry (`@import "tailwindcss"` + `@theme inline`)
│   ├── README.md         # Documents the (dashboard)/(auth) route-group convention
│   ├── (dashboard)/       # Authenticated app pages (route group — no URL segment added)
│   │   └── page.tsx      # Currently the default Next.js scaffold page ("/")
│   └── (auth)/            # Public auth pages (sign-in, sign-up) — empty until auth work starts
├── features/
│   ├── README.md         # Documents the feature-folder convention
│   └── auth/              # Example feature folder (only one scaffolded so far)
│       ├── components/   # Feature-local UI components
│       ├── hooks/         # Feature-local hooks (state, side effects)
│       ├── api.ts          # Calls pte-api via @pte/api-client, wrapped in TanStack Query
│       └── types.ts        # Feature-local types not worth sharing via api-client
├── public/                  # Static assets (favicon, svgs)
├── next.config.ts            # transpilePackages: ["@pte/ui", "@pte/api-client"]
├── tsconfig.json               # extends ../../packages/config/tsconfig.base.json
├── postcss.config.mjs           # Tailwind v4 PostCSS plugin only (no content array — CSS-first config)
├── eslint.config.mjs             # Re-exports @pte/config/eslint
└── package.json                   # App name, deps; workspace deps via "workspace:*"
```

`app/` stays thin — routing and layout composition only. Pages import logic
from the matching `features/<name>/` folder; they don't contain business logic
themselves. Auth gating (redirect when no session) is a future `middleware.ts`
concern, not something the route-group name implies on its own.

Feature folders are named after the matching `pte-api` (Spring Boot) bounded
context — `iam`, `tenancy`, `question-bank`, `exam-operations`, `exam-delivery`,
`scoring` — or a frontend-only concern like `auth`. Create a folder only when
real work on that feature starts; don't pre-scaffold every context up front.

### `packages/ui/`

```
packages/ui/
├── src/
│   ├── index.ts            # Barrel export — apps import from "@pte/ui"
│   └── components/          # Shared, presentational-only React components
└── package.json
```

Consumed unbuilt via `transpilePackages` in each app's `next.config.ts` — no
separate build/publish step. No Tailwind `content` config needed here: Tailwind
v4 is CSS-first (configured per-app in `globals.css`), not via a shared
`tailwind.config.ts`.

### `packages/config/`

```
packages/config/
├── eslint.config.mjs        # Shared flat ESLint config — re-exported as "@pte/config/eslint"
├── tsconfig.base.json        # Shared compiler options — extended as "@pte/config/tsconfig"
└── package.json
```

Each app's own `eslint.config.mjs`/`tsconfig.json` is a thin file that
re-exports/extends these — apps can still override locally if one ever needs to.

### `packages/api-client/`

```
packages/api-client/
├── src/
│   ├── index.ts             # Barrel export — apps import from "@pte/api-client"
│   ├── types/                # Hand-written types mirroring pte-api DTOs
│   └── requests/               # Thin wrapper functions around fetch, one per pte-api endpoint
└── package.json
```

The shared, cross-app service layer: raw request functions + types live here so
`tenant-web` and `vendor-web` never duplicate HTTP-call logic for the same
backend. `types/` is isolated so a future OpenAPI/springdoc codegen pass only
touches this folder, not call sites in `features/*/api.ts`. Per-feature `api.ts`
files (inside each app) build on top of these with TanStack Query hooks.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`)
- **Monorepo tooling:** pnpm workspaces + Turborepo
- **Server state:** TanStack Query (planned — not yet installed)
- **Backend:** `pte-api` (Spring Boot, separate repo) over REST

See `pte-doc/projects/aptis-mvp/team/techlead/` for the full architecture
decision record (ADR-005, ADR-006) behind this structure.
