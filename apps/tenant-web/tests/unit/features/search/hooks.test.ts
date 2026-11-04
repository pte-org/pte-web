import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  t: vi.fn((_k: string, fb?: string) => fb ?? _k),
}));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({ t: hoisted.t }),
}));

import { useDebouncedSearch } from "@/features/search/useDebouncedSearch";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { TENANT_SEARCH_TEXT, type TenantSearchSurface } from "@/features/search/constants";

describe("features/search - hooks", () => {
  describe("useDebouncedSearch", () => {
    it("returns trimmed initial search value", () => {
      let value!: string;
      renderToStaticMarkup(createElement(() => {
        value = useDebouncedSearch("  hello world  ");
        return null;
      }));

      expect(value).toBe("hello world");
    });
  });

  describe("useTenantSearchText", () => {
    const surfaces: TenantSearchSurface[] = [
      "auditLog",
      "supportTickets",
      "classes",
      "students",
      "sessions",
    ];

    for (const surface of surfaces) {
      it(`resolves search copy for ${surface}`, () => {
        let copy!: ReturnType<typeof useTenantSearchText>;
        renderToStaticMarkup(createElement(() => {
          copy = useTenantSearchText(surface);
          return null;
        }));

        expect(copy.placeholder).toBe(TENANT_SEARCH_TEXT[surface].placeholder);
        expect(copy.ariaLabel).toBe(TENANT_SEARCH_TEXT[surface].ariaLabel);
      });
    }
  });
});

