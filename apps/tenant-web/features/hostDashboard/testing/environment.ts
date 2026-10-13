import { vi } from "vitest";

/**
 * Test-only environment for server-rendering the dashboard components in vitest's node
 * environment (which has no `@/` alias). Import this module FIRST in a test file so its
 * `vi.mock` calls are registered before any component is loaded.
 *
 * - the active locale and the tenant's organisation nouns are driven through `environment`
 * - `useRouter` records navigation instead of needing the Next.js app router
 * - `LearnersOverview` (own roster request, untouched by this feature) is replaced by a marker
 */
export interface TestOrgLabels {
  program: string;
  class: string;
  isLoading: boolean;
}

const state = vi.hoisted(() => ({
  locale: "en" as "en" | "vi",
  labels: { program: "Program", class: "Class", isLoading: false } as TestOrgLabels,
  push: vi.fn<(href: string) => void>(),
}));

// A hoisted value cannot be exported directly, so it is re-exported through a plain binding.
export const environment = state;

export const LEARNERS_OVERVIEW_MARKER = "learners-overview-marker";

vi.mock("@/features/orgLabels/useOrgLabels", () => ({
  useOrgLabels: () => state.labels,
}));

vi.mock("@/features/orgLabels/constants", async () => await import("../../orgLabels/constants"));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: state.push }),
}));

vi.mock("@/features/examoperations/components", async () => {
  const { createElement } = await import("react");
  return {
    LearnersOverview: () =>
      createElement("section", { "aria-label": "learners-overview-marker" }, "learners-overview-marker"),
  };
});

// Components of @pte/ui read the locale through their own provider (always Vietnamese on the
// server, effects do not run); only the dashboard copy is switched here via the hook the
// dashboard text hook imports from the package entry.
vi.mock("@pte/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pte/ui")>();
  return {
    ...actual,
    useLocale: () => ({
      locale: state.locale,
      setLocale: (): void => undefined,
      t: (key: string, fallback?: string): string => fallback ?? key,
    }),
  };
});
