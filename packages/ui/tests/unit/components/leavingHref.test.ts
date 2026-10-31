import { describe, expect, it } from "vitest";
import { getLeavingHref } from "../../../src/components/leavingHref";

const CURRENT = "https://admin.example.com/admin/exam-template/abc/edit";

const anchor = (href: string, overrides: { target?: string; hasDownload?: boolean } = {}) => ({
  href,
  target: overrides.target ?? "",
  hasDownload: overrides.hasDownload ?? false,
});

describe("getLeavingHref", () => {
  it("returns the in-app path of a link to another page", () => {
    expect(getLeavingHref(anchor("https://admin.example.com/admin/tenants"), CURRENT)).toBe(
      "/admin/tenants",
    );
  });

  it("keeps the query string and hash of the destination", () => {
    expect(
      getLeavingHref(anchor("https://admin.example.com/admin/exam-template?page=2#top"), CURRENT),
    ).toBe("/admin/exam-template?page=2#top");
  });

  it("treats an explicit _self target as a normal link", () => {
    expect(
      getLeavingHref(anchor("https://admin.example.com/admin", { target: "_self" }), CURRENT),
    ).toBe("/admin");
  });

  it("ignores links that open elsewhere or download a file", () => {
    expect(
      getLeavingHref(anchor("https://admin.example.com/admin", { target: "_blank" }), CURRENT),
    ).toBeNull();
    expect(
      getLeavingHref(anchor("https://admin.example.com/file.pdf", { hasDownload: true }), CURRENT),
    ).toBeNull();
  });

  it("leaves external sites to the browser's own unload prompt", () => {
    expect(getLeavingHref(anchor("https://other.example.org/page"), CURRENT)).toBeNull();
    expect(getLeavingHref(anchor("http://admin.example.com/admin"), CURRENT)).toBeNull();
  });

  it("does not guard a link back to the current page or a hash on it", () => {
    expect(getLeavingHref(anchor(CURRENT), CURRENT)).toBeNull();
    expect(getLeavingHref(anchor(`${CURRENT}#section`), CURRENT)).toBeNull();
  });

  it("guards the same path with a different query string", () => {
    expect(getLeavingHref(anchor(`${CURRENT}?tab=weights`), CURRENT)).toBe(
      "/admin/exam-template/abc/edit?tab=weights",
    );
  });

  it("returns null for an unparseable current location instead of throwing", () => {
    expect(getLeavingHref(anchor("https://admin.example.com/admin"), "not a url")).toBeNull();
  });
});
