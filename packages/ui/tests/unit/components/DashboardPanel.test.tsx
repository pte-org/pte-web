import { describe, expect, it } from "vitest";
import { countMatches, findOpeningTag, renderHtml, textOf } from "../testing/renderHtml";
import { DashboardPanel, type DashboardPanelProps } from "../../../src/components/DashboardPanel";

const ERROR_PROPS = {
  title: "Could not load",
  description: "Try again later",
  retryLabel: "Retry now",
} as const;

const EMPTY_PROPS = { title: "Nothing here", description: "No data yet" } as const;

const renderPanel = (props: Partial<DashboardPanelProps> = {}): string =>
  renderHtml(
    <DashboardPanel title="Revenue" {...props}>
      <p>BODY</p>
    </DashboardPanel>,
  );

describe("DashboardPanel structure", () => {
  it("is a region named by its h2 title", () => {
    const html = renderPanel();
    const region = findOpeningTag(html, "div", 'role="region"') ?? "";
    const labelledBy = region.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeTruthy();
    expect(html).toContain(`<h2 id="${labelledBy}"`);
    expect(html).toMatch(/<h2 [^>]*>Revenue<\/h2>/);
    expect(countMatches(html, /<h1/)).toBe(0);
  });

  it("gives two panels in one tree distinct title ids", () => {
    const html = renderHtml(
      <>
        <DashboardPanel title="A" />
        <DashboardPanel title="B" />
      </>,
    );
    const ids = [...html.matchAll(/<h2 id="([^"]+)"/g)].map((match) => match[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it("renders subtitle and actions only when supplied", () => {
    const plain = renderPanel();
    expect(plain).not.toContain("mt-1 text-xs");
    expect(plain).not.toContain("justify-end");

    const full = renderPanel({ subtitle: "Last 30 days", actions: <button type="button">Export</button> });
    expect(full).toContain('<p class="mt-1 text-xs text-[var(--ink-secondary)]">Last 30 days</p>');
    expect(full).toContain("justify-end");
    expect(full).toContain("<button type=\"button\">Export</button>");
  });

  it("renders one primary navigation action in the footer when supplied", () => {
    const html = renderPanel({ footerAction: <a href="/details">View details</a> });
    expect(html).toContain('class="mt-auto border-t border-[var(--shell-border)]/60 pt-3"');
    expect(html).toContain('<a href="/details">View details</a>');
  });

  it("applies className to the surface and contentClassName to the body", () => {
    const html = renderPanel({ className: "xl:col-span-2", contentClassName: "min-h-40" });
    expect(findOpeningTag(html, "div", 'role="region"')).toContain("xl:col-span-2");
    expect(html).toContain('class="min-w-0 min-h-40"');
  });
});

describe("DashboardPanel status", () => {
  it("defaults to content: renders children, aria-busy=false, no status/alert roles", () => {
    const html = renderPanel();
    expect(html).toContain("<p>BODY</p>");
    expect(html).toContain('aria-busy="false"');
    expect(html).not.toContain('role="status"');
    expect(html).not.toContain('role="alert"');
  });

  it("loading: aria-busy=true, polite status with the sr-only label, 3 skeleton rows, no children", () => {
    const html = renderPanel({ status: "loading", loadingLabel: "Loading revenue" });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('<div role="status" aria-live="polite"');
    expect(html).toContain('<span class="sr-only">Loading revenue</span>');
    expect(countMatches(html, /pte-skeleton/)).toBe(3);
    expect(html).not.toContain("BODY");
  });

  it("loading without a label omits the sr-only span", () => {
    const html = renderPanel({ status: "loading" });
    expect(html).not.toContain("sr-only");
    expect(html).toContain('role="status"');
  });

  it.each(["content", "error", "empty"] as const)("aria-busy is false for status '%s'", (status) => {
    expect(renderPanel({ status, error: { ...ERROR_PROPS }, empty: { ...EMPTY_PROPS } })).toContain(
      'aria-busy="false"',
    );
  });

  it("error: role=alert with title, description and a retry button carrying the label", () => {
    const html = renderPanel({ status: "error", error: { ...ERROR_PROPS, onRetry: () => undefined } });
    expect(html).toContain('<div role="alert">');
    expect(html).toContain("<h3");
    expect(textOf(html)).toContain("Could not load");
    expect(textOf(html)).toContain("Try again later");
    expect(html).toMatch(/<button type="button"[^>]*><span>Retry now<\/span><\/button>/);
    expect(html).not.toContain("BODY");
    expect(html).not.toContain('role="status"');
  });

  it("error without onRetry hides the retry button but keeps the alert", () => {
    const html = renderPanel({ status: "error", error: { ...ERROR_PROPS } });
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("<button");
    expect(html).not.toContain("Retry now");
  });

  it("error status without an error object leaves the body empty (documented contract)", () => {
    const html = renderPanel({ status: "error" });
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain("BODY");
    expect(html).toContain('<div class="min-w-0"></div>');
  });

  it("empty: shows the title/description and the action, not the children", () => {
    const html = renderPanel({
      status: "empty",
      empty: { ...EMPTY_PROPS, action: <a href="/new">Create one</a> },
    });
    expect(textOf(html)).toContain("Nothing here");
    expect(textOf(html)).toContain("No data yet");
    expect(html).toContain('<a href="/new">Create one</a>');
    expect(html).not.toContain("BODY");
    expect(html).not.toContain('role="alert"');
  });

  it("empty status without an empty object leaves the body empty", () => {
    expect(renderPanel({ status: "empty" })).toContain('<div class="min-w-0"></div>');
  });

  it("only reads the state object that matches the status", () => {
    const html = renderPanel({ status: "content", error: { ...ERROR_PROPS }, empty: { ...EMPTY_PROPS } });
    expect(html).toContain("BODY");
    expect(html).not.toContain("Could not load");
    expect(html).not.toContain("Nothing here");
  });
});

describe("DashboardPanel copy comes from props", () => {
  it("contains no copy of its own when no text props are given", () => {
    const html = renderHtml(<DashboardPanel title="T" status="loading" />);
    expect(textOf(html)).toBe("T");
  });
});
