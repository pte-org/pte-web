<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PTE Web coding rules

Before inspecting a change in depth or writing code, read [docs/CODING_STANDARDS_WEB.md](docs/CODING_STANDARDS_WEB.md) and follow its rules. These instructions apply to every app and package in this workspace.

## Common UI is mandatory

- Search `packages/ui` (`@pte/ui`) and existing screens before creating UI. Reuse the existing common component whenever it covers the requirement, including headers, actions, fields, tables, loading, dialogs, badges and description lists.
- Use common components as shipped. Do not override their font, font size, weight, color, trigger, sizing or other visual defaults to imitate a mockup. Keep the system's typography, tokens and variants. Layout composition is allowed; a missing reusable capability belongs in the common component, not a feature-local visual clone.
- For example, use `PageHeader` for page titles and the default `ActionMenu` ellipsis trigger; do not replace them with hand-styled headings or an `Actions` trigger.

## Responsibilities and messages

- Keep route files thin. Separate rendering, data fetching, state/actions, types, constants and utilities by responsibility. Do not accumulate all feature logic in one component/file.
- Follow the standard's limits: component functions under 150 lines and files under 300 lines. Extract focused components/hooks when necessary; do not split merely to hide complexity.
- Put user-facing labels, messages, validation/error copy and configuration in feature constants/shared catalogs. Use the existing locale/i18n mechanism for translated copy. No inline user-facing messages in JSX or handlers, and no raw API/machine errors displayed to users.
- Keep domain logic in its feature; only domain-neutral UI belongs in `@pte/ui`. Client API access belongs in feature `api.ts` hooks backed by `@pte/api-client` and TanStack Query.

## Verification

### Test file placement

- Each app/package owns a `tests/` directory alongside `features/` or `src/`. Keep all test code outside production folders.
- Unit/component tests belong in `tests/unit/`, mirroring the source tree: `apps/tenant-web/tests/unit/features/exams/...` and `packages/api-client/tests/unit/requests/...`.
- Use `tests/integration/` and `tests/e2e/` for those suites. Never put `.test.*`, `.spec.*`, `__tests__`, fixtures, mocks, or test helpers alongside production components, hooks, requests, or types.
- Keep test-only fixtures and helpers under `tests/`; preserve assertions when relocating tests. Production code must never import test code.
- Configure Vitest to discover tests only under `tests/`; include tests in TypeScript checks. Update relative imports, mocks, and filesystem/contract paths when moving files.
- Before handoff, verify no test files remain under production folders and run all affected test suites and typechecks. Report skipped/failing checks explicitly.

- Review the relevant coding-standard checklist before handing off. Run scoped lint, typecheck and appropriate tests/build checks; report exactly what was verified and any outstanding limitations.
- Preserve unrelated worktree changes. Do not fix a UI inconsistency by silently changing common defaults across other screens.
