import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "../../../src/i18n";
import { ErrorPage, errorPageKindOf } from "../../../src/components/ErrorPage";

describe("errorPageKindOf", () => {
  it("tells a rate limit apart from other failures", () => {
    expect(errorPageKindOf({ status: 429 })).toBe("rateLimited");
    expect(errorPageKindOf({ status: 503 })).toBe("unavailable");
    expect(errorPageKindOf({ status: 418 })).toBe("generic");
  });
});

describe("ErrorPage for a rate limit", () => {
  it("says the system is busy in Vietnamese by default and offers a retry", () => {
    const html = renderToStaticMarkup(
      <LocaleProvider>
        <ErrorPage kind="rateLimited" homeHref="/" onRetry={() => undefined} />
      </LocaleProvider>,
    );
    expect(html).toContain("Hệ thống đang bận");
    expect(html).toContain("429");
    expect(html).toContain("Thử lại");
  });
});
