import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  options: {} as { queryKey?: readonly unknown[]; queryFn?: () => unknown; enabled?: boolean },
  searchTenantsPage: vi.fn(),
  apiClient: {},
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: state.apiClient }));
vi.mock("@/features/commercialization/constants", () => ({ LICENSE_CODES_QUERY_KEY: ["license-codes"] }));
vi.mock("@pte/api-client", () => ({ searchTenantsPage: state.searchTenantsPage }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: typeof state.options) => { state.options = options; return {}; },
}));

import { useTenantSearchQuery } from "../../../../features/licenseGrant/api";

beforeEach(() => state.searchTenantsPage.mockReset());

describe("grant organization queries", () => {
  it.each(["", "a", "  org  "])("allows an open lookup for %j with a bounded page", async (term) => {
    useTenantSearchQuery(term, 0, true);
    expect(state.options.enabled).toBe(true);
    await state.options.queryFn?.();
    expect(state.searchTenantsPage).toHaveBeenCalledWith(state.apiClient, term.trim(), 0, 20);
  });

  it("isolates page/search cache entries and disables hidden or debouncing lookups", () => {
    useTenantSearchQuery("org", 0, true);
    const first = state.options.queryKey;
    useTenantSearchQuery("org", 1, true);
    expect(state.options.queryKey).not.toEqual(first);
    useTenantSearchQuery("other", 1, true);
    expect(state.options.queryKey).toContain("other");
    useTenantSearchQuery("", 0, false);
    expect(state.options.enabled).toBe(false);
  });
});
