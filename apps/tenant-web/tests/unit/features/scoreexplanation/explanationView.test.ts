import { describe, expect, it } from "vitest";
import { ApiError } from "@pte/api-client";
import {
  explanationScreenState,
  formatApiNumber,
  formatMessage,
  isHiddenExplanationError,
  scoreExplanationHref,
  shouldRetryExplanation,
  shouldShowNoTraceNotice,
  storedTraitEntries,
  traceKindMessageKey,
  traitTraceRows,
  uncalibratedAzureLabel,
} from "../../../../features/scoreexplanation/explanationView";
import { explanation, item, parameters, rubricTrace } from "./fixtures";

const forbidden = new ApiError("forbidden", 403, "denied");
const notFound = new ApiError("unknown", 404, "missing");
const server = new ApiError("server", 500, "boom");

describe("access errors", () => {
  it("treats 403 and 404 the same, so the screen never reveals that an attempt exists", () => {
    expect(isHiddenExplanationError(forbidden)).toBe(true);
    expect(isHiddenExplanationError(notFound)).toBe(true);
    expect(isHiddenExplanationError(server)).toBe(false);
    expect(isHiddenExplanationError(new Error("x"))).toBe(false);
  });

  it("does not retry a hidden attempt but retries a server failure a few times", () => {
    expect(shouldRetryExplanation(0, forbidden)).toBe(false);
    expect(shouldRetryExplanation(0, notFound)).toBe(false);
    expect(shouldRetryExplanation(0, server)).toBe(true);
    expect(shouldRetryExplanation(2, server)).toBe(false);
  });

  it("decides the screen state, hiding an attempt that belongs to another exam in the address", () => {
    const data = explanation();
    expect(explanationScreenState({ isLoading: true, error: null, data: undefined })).toBe("loading");
    expect(explanationScreenState({ isLoading: false, error: notFound, data: undefined })).toBe("hidden");
    expect(explanationScreenState({ isLoading: false, error: server, data: undefined })).toBe("error");
    expect(explanationScreenState({ isLoading: false, error: null, data })).toBe("ready");
    expect(
      explanationScreenState({ isLoading: false, error: null, data, expectedSessionPublicId: "other" }),
    ).toBe("hidden");
    expect(
      explanationScreenState({ isLoading: false, error: null, data, expectedSessionPublicId: data.sessionPublicId }),
    ).toBe("ready");
  });
});

describe("paths by role", () => {
  it("builds the host and examiner routes", () => {
    expect(scoreExplanationHref("HOST_ADMIN", "s-1", "a-1")).toBe(
      "/host/exams/s-1/attempts/a-1/score-explanation",
    );
    expect(scoreExplanationHref("EXAMINER", "s-1", "a-1")).toBe(
      "/examiner/work/s-1/a-1/score-explanation",
    );
  });
});

describe("item trace", () => {
  it("maps the API's contributions to rows without recomputing anything", () => {
    const rows = traitTraceRows(item({ trace: rubricTrace({ gateTriggeredBy: "CONTENT" }) }));
    expect(rows).toEqual([
      { key: "CONTENT", achieved: 0, max: 6, effectiveWeight: 6, gateTriggered: true },
      { key: "FORM", achieved: 2, max: 2, effectiveWeight: 2, gateTriggered: false },
    ]);
  });

  it("has no rows without a rubric trace", () => {
    expect(traitTraceRows(item({ traceKind: "EXAMINER_SCORE", trace: null }))).toEqual([]);
  });

  it("lists stored trait scores only when there is no trace to show them", () => {
    const stored = { CONTENT: 3, FORM: 1 };
    expect(storedTraitEntries(item({ traceKind: "TRACE_UNAVAILABLE", trace: null, traitScores: stored }))).toEqual([
      ["CONTENT", 3],
      ["FORM", 1],
    ]);
    expect(storedTraitEntries(item({ traitScores: stored }))).toEqual([]);
    expect(storedTraitEntries(item({ traceKind: "NOT_SCORED", trace: null, traitScores: null }))).toEqual([]);
  });

  it("names an honest message for every kind and for an unknown one", () => {
    for (const kind of [
      "RUBRIC",
      "LEGACY_NO_TRACE",
      "EXAMINER_SCORE",
      "OBJECTIVE",
      "UNSCORED",
      "NOT_SCORED",
      "TRACE_UNAVAILABLE",
    ]) {
      expect(traceKindMessageKey(kind)).toBe(`kind${kind}`);
    }
    expect(traceKindMessageKey("SOMETHING_NEW")).toBe("kindUnknown");
  });
});

describe("display values", () => {
  it("shows API numbers as sent and a dash for a missing one", () => {
    expect(formatApiNumber(53.333333)).toBe("53.333333");
    expect(formatApiNumber(0)).toBe("0");
    expect(formatApiNumber(null)).toBe("—");
    expect(formatApiNumber(undefined)).toBe("—");
  });

  it("shows the no-trace notice only when the API says there is no trace", () => {
    expect(shouldShowNoTraceNotice(explanation({ traceAvailable: false }))).toBe(true);
    expect(shouldShowNoTraceNotice(explanation({ traceAvailable: true }))).toBe(false);
  });

  it("labels an uncalibrated Azure mapping with the API's text, falling back only when it is blank", () => {
    const label = "chưa hiệu chỉnh với dữ liệu người chấm";
    expect(uncalibratedAzureLabel(parameters({ azureMappingCalibrated: false, azureMappingLabel: label }), "fb")).toBe(
      label,
    );
    expect(uncalibratedAzureLabel(parameters({ azureMappingCalibrated: false, azureMappingLabel: " " }), "fb")).toBe(
      "fb",
    );
    expect(uncalibratedAzureLabel(parameters({ azureMappingCalibrated: true }), "fb")).toBeNull();
    expect(uncalibratedAzureLabel(parameters({ azureMappingCalibrated: null }), "fb")).toBeNull();
  });

  it("fills message placeholders", () => {
    expect(formatMessage("{a}–{b} ({c})", { a: 1, b: 2 })).toBe("1–2 ({c})");
  });
});
