import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type { AzureMappingResponse } from "@pte/api-client";
import { AzureBandMapping } from "../../../../features/scoringrubric/components/_AzureBandMapping";
import { FormBandTable } from "../../../../features/scoringrubric/components/_FormBandTable";
import { GateList } from "../../../../features/scoringrubric/components/_GateList";
import { ObjectiveRuleCard } from "../../../../features/scoringrubric/components/_ObjectiveRuleCard";
import { SkillWeightPanel } from "../../../../features/scoringrubric/components/_SkillWeightPanel";
import { TraitTable } from "../../../../features/scoringrubric/components/_TraitTable";
import { trait } from "./fixtures";

const render = (element: ReactElement): string =>
  renderToStaticMarkup(createElement(LocaleProvider, null, element));

const mapping = (overrides: Partial<AzureMappingResponse> = {}): AzureMappingResponse => ({
  version: "1",
  calibrated: false,
  label: "chưa hiệu chỉnh với dữ liệu người chấm",
  pronunciationInput: "Phát âm = điểm accuracy (0-100) của Azure.",
  oralFluencyInput: "Độ trôi chảy = trung bình fluency và prosody.",
  pronunciationBands: [
    { band: 5, minAzureScore: 90 },
    { band: 1, minAzureScore: 30 },
  ],
  oralFluencyBands: [{ band: 5, minAzureScore: 90 }],
  ...overrides,
});

describe("TraitTable", () => {
  it("shows every trait's scale, scorer, weight and folded level descriptions", () => {
    const html = render(
      createElement(TraitTable, {
        traits: [
          trait("CONTENT", 6, false, {
            displayNameVi: "Nội dung",
            weight: 6,
            levels: [
              { level: 0, text: "Does not deal properly with the prompt." },
              { level: 6, text: "Fully addresses the prompt." },
            ],
          }),
          trait("PRONUNCIATION", 5, false, { source: "AZURE", displayNameVi: "Phát âm" }),
        ],
      }),
    );
    expect(html).toContain("Nội dung");
    expect(html).toContain("Phát âm");
    expect(html).toContain("Azure chấm phát âm");
    expect(html).toContain("<details");
    expect(html).toContain("Fully addresses the prompt.");
    expect(html.indexOf("Mức 6")).toBeLessThan(html.indexOf("Mức 0"));
  });

  it("names the per-word scale instead of a number", () => {
    const html = render(createElement(TraitTable, { traits: [trait("CONTENT", null, true)] }));
    expect(html).toContain("N (số từ của đoạn văn)");
  });

  it("explains an answer-key task type has no traits", () => {
    expect(render(createElement(TraitTable, { traits: [] }))).toContain("chấm theo đáp án");
  });
});

describe("AzureBandMapping", () => {
  it("always shows the API's uncalibrated label with the thresholds", () => {
    const html = render(createElement(AzureBandMapping, { mapping: mapping() }));
    expect(html).toContain("chưa hiệu chỉnh với dữ liệu người chấm");
    expect(html).toContain("Phiên bản bảng 1");
    expect(html).toContain("Phát âm = điểm accuracy (0-100) của Azure.");
    expect(html).toContain(">90<");
  });

  it("falls back to the local wording when the API sends no label but the table is uncalibrated", () => {
    const html = render(createElement(AzureBandMapping, { mapping: mapping({ label: null }) }));
    expect(html).toContain("chưa hiệu chỉnh với dữ liệu người chấm");
  });

  it("shows no uncalibrated label once the table is calibrated", () => {
    const html = render(
      createElement(AzureBandMapping, { mapping: mapping({ calibrated: true, label: null }) }),
    );
    expect(html).not.toContain("chưa hiệu chỉnh");
  });

  it("says thresholds are unavailable for an undeclared mapping version", () => {
    const html = render(
      createElement(AzureBandMapping, {
        mapping: mapping({ pronunciationBands: [], oralFluencyBands: [] }),
      }),
    );
    expect(html).toContain("không có ngưỡng");
    expect(html).toContain("chưa hiệu chỉnh với dữ liệu người chấm");
  });
});

describe("gates, form, objective rule and weights", () => {
  it("marks each gate on or off", () => {
    const html = render(
      createElement(GateList, {
        gates: [
          { traitKey: "CONTENT", enabled: true },
          { traitKey: "FORM", enabled: false },
        ],
        traits: [trait("CONTENT", 6, false, { displayNameVi: "Nội dung" })],
      }),
    );
    expect(html).toContain("Nội dung");
    expect(html).toContain("FORM");
    expect(html).toContain("Bật");
    expect(html).toContain("Tắt");
  });

  it("lists the Form bands as declared", () => {
    const html = render(
      createElement(FormBandTable, {
        bands: [
          { minWords: 200, maxWords: 300, band: 2 },
          { minWords: 120, maxWords: 199, band: 1 },
        ],
      }),
    );
    expect(html).toContain("200–300");
    expect(html).toContain("120–199");
  });

  it("shows the objective formula from the API", () => {
    const html = render(
      createElement(ObjectiveRuleCard, {
        rule: { code: "PLUS_MINUS", descriptionVi: "+1 mỗi đáp án đúng, −1 mỗi đáp án sai, thấp nhất 0." },
      }),
    );
    expect(html).toContain("+1 mỗi đáp án đúng");
    expect(html).toContain("PLUS_MINUS");
  });

  it("shows the stored template weights, or why there are none", () => {
    const weights = { overall: 8.17, speaking: 15.84, writing: 0, reading: 0, listening: 16.83 };
    expect(render(createElement(SkillWeightPanel, { weights }))).toContain("15.84");
    expect(render(createElement(SkillWeightPanel, { weights: null }))).toContain(
      "không có trong mẫu đề",
    );
    expect(render(createElement(SkillWeightPanel, { weights: undefined }))).toContain(
      "Chọn một mẫu đề",
    );
  });
});
