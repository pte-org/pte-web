import { describe, expect, it } from "vitest";
import { countMatches, findOpeningTag, renderHtml, textOf } from "../testing/renderHtml";
import { DashboardLoadingState, type DashboardLoadingVariant } from "./DashboardLoadingState";

const skeletons = (html: string): number => countMatches(html, /pte-skeleton/);
const render = (variant?: DashboardLoadingVariant): string =>
  renderHtml(<DashboardLoadingState variant={variant} />);

describe("DashboardLoadingState shared shell", () => {
  it.each(["page", "detail", "table", "overview"] as const)(
    "variant '%s' is a polite status region with a label and sr-only text",
    (variant) => {
      const html = renderHtml(<DashboardLoadingState variant={variant} label="Loading dashboard" />);
      const root = findOpeningTag(html, "div", 'role="status"') ?? "";
      expect(root).toContain('aria-live="polite"');
      expect(root).toContain('aria-label="Loading dashboard"');
      expect(html).toContain('<span class="sr-only">Loading dashboard</span>');
    },
  );

  it("applies className to the root", () => {
    expect(renderHtml(<DashboardLoadingState className="p-8" />)).toMatch(/^<div [^>]*class="space-y-6 p-8"/);
  });
});

describe("DashboardLoadingState default variant is untouched", () => {
  it("renders exactly the same markup as the explicit 'page' variant", () => {
    expect(render()).toBe(render("page"));
  });

  it("keeps the page shape: header, 4 simple KPI cards, then the table skeleton", () => {
    const html = render();
    const tableOnly = skeletons(render("table")) - 2; // table variant = 2 header skeletons + LoadingState
    expect(skeletons(html)).toBe(2 + 4 * 2 + tableOnly);
    expect(countMatches(html, /<div class="rounded-xl border border-\[var\(--shell-border\)\] bg-\[var\(--surface-card\)\] p-5">/)).toBe(4);
    expect(html).toContain('<div aria-hidden="true" class="pte-skeleton rounded bg-[var(--skeleton-base)] mt-5 h-8 w-1/3"></div>');
    expect(html).not.toContain("mt-3 h-3 w-1/2");
    expect(html).not.toContain("xl:grid-cols-3");
  });

  it("uses the Vietnamese default label", () => {
    expect(textOf(render())).toBe("Đang tải trang");
  });

  it("keeps the table and detail variants structurally unchanged", () => {
    const table = render("table");
    expect(table).toContain("w-52");
    expect(table).not.toContain("xl:grid-cols-3");
    const detail = render("detail");
    expect(countMatches(detail, /lg:grid-cols-2/)).toBe(1);
    expect(skeletons(detail)).toBe(2 + 2 * 4);
    expect(detail).not.toContain("xl:grid-cols-3");
  });
});

describe("DashboardLoadingState overview variant", () => {
  const overview = render("overview");

  it("has its own, distinct markup", () => {
    expect(overview).not.toBe(render());
    expect(overview).not.toBe(render("detail"));
    expect(overview).not.toBe(render("table"));
  });

  it("renders header, 4 KPI cards (value + delta rows) and four chart/list panels", () => {
    expect(skeletons(overview)).toBe(2 + 4 * 3 + 4 * 2);
    expect(countMatches(overview, /mt-3 h-3 w-1\/2/)).toBe(4);
    expect(countMatches(overview, /mt-5 h-48 w-full/)).toBe(4);
    expect(countMatches(overview, /xl:grid-cols-3/)).toBe(2);
    expect(countMatches(overview, /xl:col-span-2/)).toBe(2);
  });

  it("reuses no table skeleton rows", () => {
    expect(overview).not.toContain("<table");
    expect(skeletons(overview)).toBeLessThan(skeletons(render()));
  });
});
