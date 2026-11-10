import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AuthPortalTemplate from "../../../app/(auth)/(portal)/template";
import { AUTH_PORTAL_METADATA } from "../../../features/auth/portalMetadata";

describe("sign-in pages template", () => {
  it("slides the page content in, and only fades it for people who ask for less motion", () => {
    const html = renderToStaticMarkup(createElement(AuthPortalTemplate, null, createElement("p", null, "page")));

    expect(html).toContain("animate-pte-fade-up");
    expect(html).toContain("motion-reduce:animate-pte-fade-in");
    expect(html).not.toContain("motion-reduce:animate-none");
    expect(html).toContain("<p>page</p>");
  });

  it("keeps the spacing the frame gives its content", () => {
    const html = renderToStaticMarkup(createElement(AuthPortalTemplate, null, createElement("p", null, "page")));

    expect(html).toMatch(/class="[^"]*flex[^"]*flex-col[^"]*gap-5/);
  });
});

describe("sign-in pages metadata", () => {
  it("never sends the page address (a reset link carries a token) to anything the page loads", () => {
    expect(AUTH_PORTAL_METADATA.referrer).toBe("no-referrer");
  });
});
