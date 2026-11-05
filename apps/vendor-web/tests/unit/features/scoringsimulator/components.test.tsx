import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SimulationTrace } from "../../../../features/scoringsimulator/components/_SimulationTrace";
import { SIMULATOR_TEXT } from "../../../../features/scoringsimulator/constants";

describe("simulation trace", () => {
  it("renders the server score, gate and contribution without recalculating", () => {
    const html = renderToStaticMarkup(<SimulationTrace text={SIMULATOR_TEXT.vi} result={{ rubricVersionPublicId: "v1",
      rawScore: 0, formBand: null, scoreTrace: { itemScore: 0, rawPercent: 0, gateTriggeredBy: "CONTENT",
        contributions: [{ key: "CONTENT", achieved: 0, max: 6, effectiveWeight: 6, weightedContribution: 0 }] } }} />);
    expect(html).toContain("CONTENT = 0");
    expect(html).toContain("Đóng góp");
    expect(html).toContain("Điểm câu");
  });
});
