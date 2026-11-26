import { describe, expect, it } from "vitest";
import { chartFacts } from "../../../../features/questiongeneration/utils/chartFacts";

describe("chartFacts", () => {
  it("reads the chart type and how many categories and series the writer gave", () => {
    const typed = {
      chartType: "LINE",
      categories: ["2019", "2020", "2021"],
      series: [
        { name: "A", values: [1, 2, 3] },
        { name: "B", values: [3, 2, 1] },
      ],
    };
    expect(chartFacts(typed)).toEqual({ chartType: "LINE", categories: 3, series: 2 });
  });

  it("is empty for a picture brief or before the writer wrote a chart", () => {
    expect(chartFacts({ imagePrompt: "a market" })).toEqual({
      chartType: null,
      categories: 0,
      series: 0,
    });
    expect(chartFacts(null)).toEqual({ chartType: null, categories: 0, series: 0 });
  });
});
