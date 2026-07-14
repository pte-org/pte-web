@AGENTS.md
@docs/CODING_STANDARDS_WEB.md

# aptis-web — AI Code Generation Rules

## Monorepo Structure (Turborepo)

Apps: `apps/tenant-web/` (learner portal), `apps/vendor-web/` (admin portal)

Shared packages: `packages/ui/` (`@aptis/ui`), `packages/api-client/` (`@aptis/api-client`), `packages/config/` (`@aptis/config`)

Feature structure per app: `src/features/{name}/{components,hooks,api.ts,constants.ts,types.ts}`

## Critical Rules (enforce on every file you write)

1. **No hardcoded strings in JSX** — use constants from `features/{name}/constants.ts`
2. **No inline styles** — use Tailwind className only (never `style={{ }}`)
3. **No `any` type** — use `unknown` with type narrowing, or define an interface
4. **File ≤ 300 lines, component function ≤ 150 lines** — extract sub-components
5. **All API calls via TanStack Query** — in `features/*/api.ts` using `useQuery`/`useMutation` (no bare `fetch()` in components)
6. **Shared components → `@aptis/ui`** — if a component is used in 2+ features or 2+ apps, extract to packages/ui
7. **Dynamic routes have `loading.tsx` and `error.tsx`** — required for every `[param]` route segment
8. **Never `// @ts-ignore`** — fix the type instead; `// @ts-expect-error` allowed only with a comment explaining why
9. **Secrets** — `NEXT_PUBLIC_*` only for non-sensitive public config; private keys/tokens stay server-side in `.env.local`
10. **Next.js primitives** — `next/image`, `next/link`, `next/font` (never raw `<img>`, `<a>`, or CSS `@import` for fonts)

## File Size Rule — Auto-Generated Code

**Exempt from 300-line limit**: generated type files from schema codegen, `next-env.d.ts`, build artifacts.

**NOT exempt**: AI-generated code (Claude Code, Copilot, Cursor) — split if over 300 lines.

## When Updating Coding Standards

Any PR that modifies `docs/CODING_STANDARDS_WEB.md` **must** also update this `CLAUDE.md` in the same PR.
