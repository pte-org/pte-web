import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { countMatches, muteRechartsSizeWarning, renderHtml, textOf } from "../testing/renderHtml";
import { CHART_TONE_DOT_CLASSES } from "../../../src/components/chartTones";
import { StatusDonutChart, type StatusDonutItem } from "../../../src/components/StatusDonutChart";

let restoreConsole: () => void;
beforeAll(() => {
  restoreConsole = muteRechartsSizeWarning();
});
afterAll(() => restoreConsole());

const ITEMS: StatusDonutItem[] = [
  { key: "a", label: "Scheduled", value: 3, tone: "info" },
  { key: "b", label: "Completed", value: 6, tone: "success" },
  { key: "c", label: "Cancelled", value: 1 },
];
const props = { totalLabel: "Sessions", emptyLabel: "No sessions", ariaLabel: "Session status" } as const;

describe("StatusDonutChart after the tone extraction (regression)", () => {
  const html = renderHtml(<StatusDonutChart {...props} items={ITEMS} />);

  it("lists items sorted by value desc with rounded percentages", () => {
    const legend = html.match(/<ul class="grid gap-3"[\s\S]*<\/ul>/)?.[0] ?? "";
    expect(textOf(legend)).toBe("Completed 6 (60%) Scheduled 3 (30%) Cancelled 1 (10%)");
  });

  it("colors the legend dots through CHART_TONE_DOT_CLASSES, defaulting to neutral", () => {
    expect(html).toContain(CHART_TONE_DOT_CLASSES.success);
    expect(html).toContain(CHART_TONE_DOT_CLASSES.info);
    expect(html).toContain(CHART_TONE_DOT_CLASSES.neutral);
    expect(html).not.toContain(CHART_TONE_DOT_CLASSES.danger);
  });

  it("shows the total and its label and names the group and list with ariaLabel", () => {
    expect(html).toContain(">10</span>");
    expect(html).toContain("Sessions</span>");
    expect(countMatches(html, /aria-label="Session status"/)).toBe(2);
  });

  it("shows the empty state for no items and for all-zero or invalid values", () => {
    for (const items of [[], [{ key: "a", label: "A", value: 0 }], [{ key: "a", label: "A", value: -4 }, { key: "b", label: "B", value: Number.NaN }]]) {
      const out = renderHtml(<StatusDonutChart {...props} items={items} />);
      expect(textOf(out)).toBe("No sessions");
      expect(out).toContain('role="img"');
    }
  });
});
