import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { countMatches, renderHtml } from "../testing/renderHtml";
import {
  ActivityIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  TrendDownIcon,
  TrendFlatIcon,
  TrendUpIcon,
} from "./dashboardIcons";

type Icon = (props: { className?: string }) => ReactElement;

const ICONS: ReadonlyArray<readonly [string, Icon]> = [
  ["CalendarIcon", CalendarIcon],
  ["ClockIcon", ClockIcon],
  ["TrendUpIcon", TrendUpIcon],
  ["TrendDownIcon", TrendDownIcon],
  ["TrendFlatIcon", TrendFlatIcon],
  ["ChartBarIcon", ChartBarIcon],
  ["ActivityIcon", ActivityIcon],
];

describe.each(ICONS)("%s", (_name, Icon) => {
  it("renders a single decorative svg (aria-hidden) by default", () => {
    const html = renderHtml(<Icon />);
    expect(html.startsWith("<svg")).toBe(true);
    expect(countMatches(html, /<svg/)).toBe(1);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("aria-label");
    expect(html).not.toContain('role="img"');
  });

  it("applies className to the svg", () => {
    const html = renderHtml(<Icon className="h-4 w-4 text-red-500" />);
    expect(html).toMatch(/<svg [^>]*class="h-4 w-4 text-red-500"/);
  });

  it("omits the class attribute when no className is given", () => {
    expect(renderHtml(<Icon />)).not.toContain("class=");
  });

  it("inherits the text color (currentColor) so tone classes can color it", () => {
    expect(renderHtml(<Icon />)).toContain("currentColor");
  });

  it("has no hard-coded color or inline style", () => {
    const html = renderHtml(<Icon />);
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(/);
    expect(html).not.toContain("style=");
  });
});

describe("dashboardIcons geometry is distinct per icon", () => {
  it("renders pairwise different markup", () => {
    const outputs = ICONS.map(([, Icon]) => renderHtml(<Icon />));
    expect(new Set(outputs).size).toBe(ICONS.length);
  });

  it("uses the shared 24x24 stroke convention for the hand-drawn icons", () => {
    for (const [name, Icon] of ICONS.filter(([name]) => name !== "CalendarIcon")) {
      const html = renderHtml(<Icon />);
      expect(html, name).toContain('viewBox="0 0 24 24"');
      expect(html, name).toContain('stroke-width="1.8"');
      expect(html, name).toContain('fill="none"');
    }
  });
});
