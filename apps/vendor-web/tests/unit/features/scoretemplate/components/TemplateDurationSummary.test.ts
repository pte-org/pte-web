import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type { PartTimeFeasibilityResponse } from "@pte/api-client";

vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));

import { TemplateDurationSummary } from "../../../../../features/scoretemplate/components/TemplateDurationSummary";

const parts: PartTimeFeasibilityResponse[] = [
  {
    part: "SPEAKING_WRITING",
    minSeconds: 3800,
    maxSeconds: 4200,
    frameMinSeconds: 4560,
    frameMaxSeconds: 5040,
    canFitFrame: false,
  },
  {
    part: "READING",
    minSeconds: 1680,
    maxSeconds: 2220,
    frameMinSeconds: 1380,
    frameMaxSeconds: 1800,
    canFitFrame: true,
  },
];

const render = (props: Parameters<typeof TemplateDurationSummary>[0]): string =>
  renderToStaticMarkup(
    createElement(LocaleProvider, null, createElement(TemplateDurationSummary, props)),
  );

describe("TemplateDurationSummary", () => {
  it("shows each part's planned minutes against its window and whether it can fit", () => {
    const html = render({ parts, totalMaxSeconds: 8100 });

    expect(html).toContain("Speaking &amp; Writing");
    expect(html).toContain("63.3–70.0 min");
    expect(html).toContain("Window 76.0–84.0 min");
    expect(html).toContain("Cannot fit");
    expect(html).toContain("Can fit");
    expect(html).toContain("Test ceiling 135.0 min");
  });

  it("says there is no time frame when the parts carry none", () => {
    const html = render({
      parts: [
        {
          part: "READING",
          minSeconds: 1680,
          maxSeconds: 2220,
          frameMinSeconds: null,
          frameMaxSeconds: null,
          canFitFrame: null,
        },
      ],
      totalMaxSeconds: null,
    });

    expect(html).toContain("No time frame set");
    expect(html).not.toContain("Window");
  });

  it("renders nothing without parts", () => {
    expect(render({ parts: undefined, totalMaxSeconds: null })).toBe("");
  });
});
