import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "../../../src/i18n";
import { DurationSummary } from "../../../src/components/DurationSummary";
import { Tabs } from "../../../src/components/Tabs";

const PARTS = [
  { id: "a", label: "Speaking", minSeconds: 4268, maxSeconds: 4879, frameMinSeconds: null, frameMaxSeconds: null, fits: null },
  { id: "b", label: "Reading", minSeconds: 1680, maxSeconds: 2220, frameMinSeconds: null, frameMaxSeconds: null, fits: null },
];
const COPY = { minutesShort: "min", window: "Window", fits: "Fits", noFit: "No fit", ceiling: "Ceiling", total: "Total" };

const render = (props: Partial<Parameters<typeof DurationSummary>[0]>): string =>
  renderToStaticMarkup(
    <LocaleProvider>
      <DurationSummary title="Duration" parts={PARTS} copy={COPY} {...props} />
    </LocaleProvider>,
  );

describe("DurationSummary", () => {
  it("keeps one decimal and the stacked list by default, with no total", () => {
    const html = render({ copy: { ...COPY, total: undefined } });
    expect(html).toContain("71.1–81.3 min");
    expect(html).not.toContain("Total");
    expect(html).not.toContain("lg:grid-cols-4");
  });

  it("can show whole minutes, side by side, with a total of the parts", () => {
    const html = render({ layout: "row", roundMinutes: true });
    expect(html).toContain("71–81 min");
    expect(html).toContain("lg:grid-cols-4");
    expect(html).toContain("Total");
    expect(html).toContain("99–118 min");
  });
});

describe("Tabs segmented", () => {
  it("renders a grey tray without the underline of the minimal tabs", () => {
    const html = renderToStaticMarkup(
      <LocaleProvider>
        <Tabs
          items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]}
          value="a"
          onChange={() => undefined}
          variant="segmented"
        />
      </LocaleProvider>,
    );
    expect(html).toContain("bg-[var(--surface-subtle)] p-1");
    expect(html).not.toContain("border-b-2");
  });
});
