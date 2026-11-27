import { describe, expect, it } from "vitest";
import type { QuestionGenerationLiveCheck } from "@pte/api-client";
import { CHECK_COPY } from "../../../../features/questiongeneration/liveCheckCopy";
import { writingBrief } from "../../../../features/questiongeneration/utils/writingBrief";

const prompt = (details: QuestionGenerationLiveCheck["details"]): QuestionGenerationLiveCheck => ({
  index: 0,
  step: "PROMPT",
  status: "PASSED",
  facts: {},
  details,
});

describe("writingBrief", () => {
  it("reads the level, topic and prompt size the writer was sent, and the topics to avoid", () => {
    const brief = writingBrief(
      [
        prompt([
          { key: "systemPrompt", unit: "CHARS", text: null, count: 2053 },
          { key: "cefr", unit: "TEXT", text: "B2", count: null },
          { key: "topicHint", unit: "TEXT", text: "", count: null },
          { key: "feedback", unit: "TEXT", text: "", count: null },
          { key: "avoidedTopics", unit: "TEXT", text: "Coffee, Rainfall in Europe", count: 2 },
        ]),
      ],
      CHECK_COPY.en,
    );
    expect(brief.lines.map((line) => line.key)).toEqual(["cefr", "topicHint", "systemPrompt"]);
    expect(brief.lines[1].value).toBe(CHECK_COPY.en.anyTopic);
    expect(brief.avoided).toEqual(["Coffee", "Rainfall in Europe"]);
  });

  it("shows the feedback of a rejected round and is empty before the prompt check", () => {
    const brief = writingBrief(
      [prompt([{ key: "feedback", unit: "TEXT", text: "Too easy for C1", count: null }])],
      CHECK_COPY.en,
    );
    expect(brief.lines).toEqual([
      { key: "feedback", label: CHECK_COPY.en.details.feedback, value: "Too easy for C1" },
    ]);
    expect(writingBrief([], CHECK_COPY.en)).toEqual({ lines: [], avoided: [] });
  });
  it("lists a topic avoided by several earlier questions once", () => {
    const brief = writingBrief(
      [prompt([{ key: "avoidedTopics", unit: "TEXT", text: "Daily Life, Coffee, Daily Life", count: 3 }])],
      CHECK_COPY.en,
    );
    expect(brief.avoided).toEqual(["Daily Life", "Coffee"]);
  });
});
