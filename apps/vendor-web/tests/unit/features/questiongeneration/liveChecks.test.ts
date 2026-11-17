import { describe, expect, it } from "vitest";
import type { QuestionGenerationLiveCheck } from "@pte/api-client";
import { CHECK_COPY, checkSummary, detailValue } from "../../../../features/questiongeneration/liveCheckCopy";
import { applyLiveEvent } from "../../../../features/questiongeneration/utils/liveItems";

const check = (step: QuestionGenerationLiveCheck["step"], status: QuestionGenerationLiveCheck["status"],
  facts: Record<string, string> = {}): QuestionGenerationLiveCheck => ({ index: 0, step, status, facts });

describe("live checks", () => {
  it("keeps the latest status of each check in the order they started", () => {
    let items = applyLiveEvent({}, { type: "check", ...check("PROMPT", "PASSED") });
    items = applyLiveEvent(items, { type: "check", ...check("WRITE", "RUNNING") });
    items = applyLiveEvent(items, { type: "check", ...check("WRITE", "PASSED") });
    items = applyLiveEvent(items, { type: "check", ...check("RULES", "FAILED", { issues: "Too short" }) });

    expect(items[0]?.checks?.map((kept) => `${kept.step}:${kept.status}`))
      .toEqual(["PROMPT:PASSED", "WRITE:PASSED", "RULES:FAILED"]);
  });

  it("starts a new round on a new prompt", () => {
    let items = applyLiveEvent({}, { type: "check", ...check("PROMPT", "PASSED") });
    items = applyLiveEvent(items, { type: "check", ...check("DUPLICATE", "FAILED") });
    items = applyLiveEvent(items, { type: "check", ...check("PROMPT", "PASSED", { feedback: "true" }) });

    expect(items[0]?.checks?.map((kept) => kept.step)).toEqual(["PROMPT"]);
  });

  it("words what each check found", () => {
    const copy = CHECK_COPY.en;
    expect(checkSummary(check("PROMPT", "PASSED", { cefr: "B2", topic: "", avoidedTopics: "3", feedback: "true" }), copy))
      .toBe("CEFR B2 · topic: chosen by the AI · avoids 3 earlier topics · with the feedback of the last round");
    expect(checkSummary(check("JSON", "FAILED", { retry: "true" }), copy)).toBe(copy.jsonRetry);
    expect(checkSummary(check("RULES", "PASSED", { fixed: "true" }), copy)).toBe(copy.rulesFixed);
    expect(checkSummary(check("DUPLICATE", "FAILED"), copy)).toBe(copy.duplicate);
  });
});

describe("check details", () => {
  const copy = CHECK_COPY.vi;
  it("words sizes, texts and written fields", () => {
    expect(detailValue({ key: "systemPrompt", unit: "CHARS", text: null, count: 1200 }, copy)).toBe("1200 ký tự");
    expect(detailValue({ key: "transcript", unit: "WORDS", text: null, count: 85 }, copy)).toBe("85 từ");
    expect(detailValue({ key: "options", unit: "ITEMS", text: null, count: 5 }, copy)).toBe("5 mục");
    expect(detailValue({ key: "question", unit: "PRESENT", text: null, count: null }, copy)).toBe("có");
    expect(detailValue({ key: "topicHint", unit: "TEXT", text: "", count: null }, copy)).toBe(copy.anyTopic);
    expect(detailValue({ key: "avoidedTopics", unit: "TEXT", text: "Business, Health", count: 2 }, copy))
      .toBe("2: Business, Health");
  });
});

describe("a new round", () => {
  it("drops the media of the round before", () => {
    let items = applyLiveEvent({}, { type: "media", index: 0, audioRef: null, imageRef: "old-chart" });
    items = applyLiveEvent(items, { type: "check", ...check("PROMPT", "PASSED") });
    expect(items[0]?.imageRef).toBeNull();
  });
});
