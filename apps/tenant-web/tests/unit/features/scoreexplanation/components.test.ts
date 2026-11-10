import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { AnswerTraceList } from "../../../../features/scoreexplanation/components/_AnswerTraceList";
import { ExplanationHeader } from "../../../../features/scoreexplanation/components/_ExplanationHeader";
import { NoTraceNotice } from "../../../../features/scoreexplanation/components/_NoTraceNotice";
import { RubricParametersPanel } from "../../../../features/scoreexplanation/components/_RubricParametersPanel";
import { SkillScoresPanel } from "../../../../features/scoreexplanation/components/_SkillScoresPanel";
import { TaskTypeAverageTable } from "../../../../features/scoreexplanation/components/_TaskTypeAverageTable";
import { explanation, item, parameters, rubricTrace, skill } from "./fixtures";

const render = (element: ReactElement): string =>
  renderToStaticMarkup(createElement(LocaleProvider, null, element));

describe("header and notices", () => {
  it("shows template, pinned rubric version and the snapshot schema of a published report", () => {
    const html = render(createElement(ExplanationHeader, { explanation: explanation() }));
    expect(html).toContain("Đã phát hành");
    expect(html).toContain("template-1 · phiên bản 3");
    expect(html).toContain("rubric-1");
    expect(html).toContain("Lược đồ 2");
  });

  it("marks an unpublished attempt as a live calculation and warns about unselected AI scores", () => {
    const html = render(
      createElement(ExplanationHeader, {
        explanation: explanation({
          published: false,
          publishedAt: null,
          schemaVersion: null,
          includesUnselectedAiScores: true,
        }),
      }),
    );
    expect(html).toContain("Chưa phát hành");
    expect(html).toContain("Tính trực tiếp");
    expect(html).toContain("Câu chưa chọn nguồn điểm");
  });

  it("explains a report without a trace", () => {
    expect(render(createElement(NoTraceNotice))).toContain("không tính lại");
  });
});

describe("pinned rubric parameters", () => {
  it("shows the pinned version, weights, gates and the API's uncalibrated Azure label", () => {
    const html = render(
      createElement(RubricParametersPanel, { parameters: explanation().rubricParameters }),
    );
    expect(html).toContain("Phiên bản 1 (ACTIVE)");
    expect(html).toContain("CONTENT 6 · PRONUNCIATION 5 · ORAL_FLUENCY 5");
    expect(html).toContain("CONTENT bật");
    expect(html).toContain("chưa hiệu chỉnh với dữ liệu người chấm");
  });

  it("shows Form bands and no Azure label for a written task type", () => {
    const html = render(
      createElement(RubricParametersPanel, {
        parameters: {
          versionPublicId: "r",
          versionNo: 2,
          status: "RETIRED",
          catalogVersion: 1,
          taskTypes: [
            parameters({
              taskType: "WRITE_ESSAY",
              formBands: [{ minWords: 200, maxWords: 300, band: 2 }],
              azureMappingVersion: null,
              azureMappingCalibrated: null,
              azureMappingLabel: null,
            }),
          ],
        },
      }),
    );
    expect(html).toContain("200–300 từ: 2");
    expect(html).toContain("RETIRED");
    expect(html).not.toContain("chưa hiệu chỉnh");
  });

  it("says so when the pinned version's parameters are not available", () => {
    expect(render(createElement(RubricParametersPanel, { parameters: null }))).toContain(
      "Không có tham số",
    );
  });
});

describe("answer traces", () => {
  it("shows each trait's achieved/max and weight, the gate and the unrounded percentage from the API", () => {
    const html = render(
      createElement(AnswerTraceList, {
        items: [item({ itemScore: 0, trace: rubricTrace({ itemScore: 0, rawPercent: 0, gateTriggeredBy: "CONTENT" }) })],
      }),
    );
    expect(html).toContain("0/6");
    expect(html).toContain("2/2");
    expect(html).toContain("Tiêu chí cổng CONTENT bằng 0");
    expect(html).toContain("Tỉ lệ chưa làm tròn: 0");
    expect(html).toContain("Số từ: 230");
  });

  it("has an honest message for every kind without a trace", () => {
    const html = render(
      createElement(AnswerTraceList, {
        items: [
          item({ answerPublicId: "a", traceKind: "LEGACY_NO_TRACE", trace: null, traitScores: null }),
          item({ answerPublicId: "b", traceKind: "EXAMINER_SCORE", scoreSource: "EXAMINER", trace: null }),
          item({
            answerPublicId: "c",
            traceKind: "OBJECTIVE",
            scoreSource: "OBJECTIVE",
            objectiveRuleCode: "PLUS_MINUS",
            trace: null,
            traitScores: null,
          }),
          item({ answerPublicId: "d", traceKind: "UNSCORED", trace: null, traitScores: null }),
          item({ answerPublicId: "e", traceKind: "NOT_SCORED", scoreSource: null, itemScore: null, trace: null }),
          item({ answerPublicId: "f", traceKind: "TRACE_UNAVAILABLE", trace: null, traitScores: { CONTENT: 3 } }),
        ],
      }),
    );
    expect(html).toContain("không có phân rã");
    expect(html).toContain("Điểm tổng của giám khảo");
    expect(html).toContain("Quy tắc: PLUS_MINUS");
    expect(html).toContain("không tính điểm trong kỳ thi");
    expect(html).toContain("Chưa có điểm");
    expect(html).toContain("không tính lại được");
    expect(html).toContain("Điểm tiêu chí đã lưu: CONTENT 3");
    expect(html).toContain("—");
  });
});

describe("averages and skills", () => {
  it("shows scored and blank counts, sum and average as sent", () => {
    const html = render(
      createElement(TaskTypeAverageTable, { averages: explanation().taskTypeAverages }),
    );
    expect(html).toContain(">12.5<");
    expect(html).toContain(">25<");
  });

  it("shows each skill's chain and says Overall does not apply when it is null", () => {
    const html = render(createElement(SkillScoresPanel, { skills: [skill()], overall: null }));
    expect(html).toContain("0.123456");
    expect(html).toContain("41.8596");
    expect(html).toContain(">42<");
    expect(html).toContain("Loại khỏi tổng");
    expect(html).toContain("Không áp dụng");
  });

  it("shows a schema-1 skill without chain fields honestly", () => {
    const html = render(
      createElement(SkillScoresPanel, {
        skills: [
          skill({ weightedSum: null, totalWeight: null, ratio: null, scaledScore: null, terms: [] }),
        ],
        overall: skill({ skill: "OVERALL", sufficientData: false, score: null, terms: [], weightedSum: null }),
      }),
    );
    expect(html).toContain("Không có các bước tính");
    expect(html).toContain("Chưa đủ dữ liệu");
  });
});
