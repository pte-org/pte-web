import { describe, expect, it } from "vitest";
import { Tabs, type TabItem, type TabsProps } from "../../../src/components/Tabs";
import { LocaleProvider } from "../../../src/i18n";
import { findOpeningTag, renderHtml } from "../testing/renderHtml";

const ITEMS: TabItem[] = [
  { id: "all", label: "All", count: 9 },
  { id: "speaking", label: "Speaking", count: 5 },
];

const noop = (): void => undefined;

// Tabs reads its default aria-label from the locale context.
const renderTabs = (props: Partial<TabsProps> & Pick<TabsProps, "value">): string =>
  renderHtml(
    <LocaleProvider>
      <Tabs items={ITEMS} onChange={noop} {...props} />
    </LocaleProvider>,
  );

describe("Tabs orientation", () => {
  it("keeps the horizontal tablist unchanged by default", () => {
    const html = renderTabs({ value: "all" });
    expect(findOpeningTag(html, "div", 'role="tablist"')).toContain('aria-orientation="horizontal"');
    expect(html).not.toContain("flex-col");
  });

  it("stacks the triggers and right-aligns the count when vertical", () => {
    const html = renderTabs({ value: "all", orientation: "vertical" });
    const tablist = findOpeningTag(html, "div", 'role="tablist"');
    expect(tablist).toContain('aria-orientation="vertical"');
    expect(tablist).toContain("flex-col");
    expect(findOpeningTag(html, "button", 'id="')).toContain("w-full");
    expect(html).toContain("ml-auto");
  });

  it("ignores the minimal variant when vertical", () => {
    const html = renderTabs({ value: "all", orientation: "vertical", variant: "minimal" });
    expect(html).not.toContain("border-b-2");
  });

  it("marks only the selected trigger as selected", () => {
    const html = renderTabs({ value: "speaking", orientation: "vertical" });
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
  });
});
