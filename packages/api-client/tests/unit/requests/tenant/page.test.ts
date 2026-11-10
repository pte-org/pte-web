import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../../../../src/client/client";
import { searchTenantsPage } from "../../../../src/requests/tenant";

describe("organization page lookup", () => {
  it("loads the first page without a search and preserves server totals", async () => {
    const page = {
      data: [{ publicId: "org-1", code: "org-1", name: "Organization 1" }],
      meta: { page: 0, size: 20, totalElements: 100000, totalPages: 5000,
        first: true, last: false, hasNext: true, hasPrevious: false },
    };
    const fetchFn = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: true, data: page }), { status: 200 },
    ));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });

    await expect(searchTenantsPage(client, "   ", 0, 20)).resolves.toEqual(page);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "https://test.invalid/api/v1/organizations/page?page=0&size=20",
    );
  });

  it("requests another page and encodes the trimmed search as one query parameter", async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: true, data: { data: [], meta: {} } }), { status: 200 },
    ));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });

    await searchTenantsPage(client, "  a+b@example.com&size=100000  ", 2, 20);
    const url = new URL(fetchFn.mock.calls[0][0]);
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.getAll("size")).toEqual(["20"]);
    expect(url.searchParams.get("q")).toBe("a+b@example.com&size=100000");
  });
});
