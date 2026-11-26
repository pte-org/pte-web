import { describe, expect, it } from "vitest";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { THINKING_TAIL_CHARS } from "../../../../features/questiongeneration/assemblyConstants";
import {
  applyLiveEvent,
  followedIndex,
} from "../../../../features/questiongeneration/utils/liveItems";
import { draftFields } from "../../../../features/questiongeneration/utils/draftFields";
import { reviewSummary } from "../../../../features/questiongeneration/utils/reviewSummary";

const item = (over: Partial<QuestionGenerationLiveItem>): QuestionGenerationLiveItem => ({
  index: 0,
  stage: null,
  activeAgent: null,
  generator: null,
  reviewer: null,
  audioRef: null,
  imageRef: null,
  ...over,
});

describe("applyLiveEvent", () => {
  it("writes an agent's text piece by piece and starts it again on a new call", () => {
    let items = applyLiveEvent({}, { type: "begin", index: 0, agent: "GENERATOR", attempt: 1 });
    items = applyLiveEvent(items, { type: "token", index: 0, agent: "GENERATOR", delta: "The " });
    items = applyLiveEvent(items, { type: "token", index: 0, agent: "GENERATOR", delta: "city" });
    expect(items[0].generator).toEqual({ attempt: 1, text: "The city" });
    items = applyLiveEvent(items, { type: "begin", index: 0, agent: "GENERATOR", attempt: 2 });
    expect(items[0].generator).toEqual({ attempt: 2, text: "" });
    expect(items[0].activeAgent).toBe("GENERATOR");
  });

  it("keeps an agent's thoughts apart from its text, and only their end", () => {
    let items = applyLiveEvent({}, { type: "begin", index: 0, agent: "REVIEWER", attempt: 1 });
    const long = "x".repeat(THINKING_TAIL_CHARS);
    items = applyLiveEvent(items, { type: "thinking", index: 0, agent: "REVIEWER", delta: long });
    items = applyLiveEvent(items, {
      type: "thinking",
      index: 0,
      agent: "REVIEWER",
      delta: "Done.",
    });
    items = applyLiveEvent(items, { type: "token", index: 0, agent: "REVIEWER", delta: "{" });
    const reviewer = items[0].reviewer;
    expect(reviewer?.text).toBe("{");
    expect(reviewer?.thinkingChars).toBe(THINKING_TAIL_CHARS + 5);
    expect(reviewer?.thinking).toHaveLength(THINKING_TAIL_CHARS);
    expect(reviewer?.thinking?.endsWith("Done.")).toBe(true);
  });

  it("lets a snapshot replace what was known and keeps the items apart", () => {
    const before = applyLiveEvent({}, { type: "token", index: 3, agent: "REVIEWER", delta: "x" });
    const after = applyLiveEvent(before, {
      type: "snapshot",
      finished: false,
      items: [item({ index: 1, stage: "REVIEWING" })],
    });
    expect(Object.keys(after)).toEqual(["1"]);
    expect(applyLiveEvent(after, { type: "stage", index: 2, stage: "GENERATING" })[1]).toBe(
      after[1],
    );
  });

  it("records media and ignores events that carry no state", () => {
    const items = applyLiveEvent({}, { type: "media", index: 0, audioRef: "a1", imageRef: null });
    expect(items[0].audioRef).toBe("a1");
    expect(applyLiveEvent(items, { type: "item", index: 0 })).toBe(items);
  });
});

describe("followedIndex", () => {
  it("follows the item being made, else the last one started", () => {
    expect(
      followedIndex([
        { index: 0, stage: "SAVED" },
        { index: 1, stage: "REVIEWING" },
        { index: 2, stage: "QUEUED" },
      ]),
    ).toBe(1);
    expect(
      followedIndex([
        { index: 0, stage: "SAVED" },
        { index: 1, stage: "FAILED" },
      ]),
    ).toBe(1);
    expect(followedIndex([{ index: 0, stage: "QUEUED" }])).toBe(0);
  });
});

describe("draftFields", () => {
  it("marks the correct options instead of listing the indexes", () => {
    const fields = draftFields({ question: "Q", options: ["a", "b"], correctIndexes: [1] });
    expect(fields.map((field) => field.key)).toEqual(["question", "options"]);
    expect(fields[1].value).toEqual({ kind: "list", items: ["a", "b"], correct: [1] });
  });

  it("shows lists of objects as records and nothing for a draft not started", () => {
    expect(draftFields({ slots: [{ answer: "cat" }] })[0].value).toEqual({
      kind: "records",
      records: [[{ key: "answer", text: "cat" }]],
    });
    expect(draftFields(undefined)).toEqual([]);
  });
});

describe("reviewSummary", () => {
  it("lists the checks written so far and the verdict", () => {
    const summary = reviewSummary({
      verdict: "FAIL",
      checks: { clarity: { ok: false, note: "vague" }, safety: {} },
      fixSuggestion: "Reword",
    });
    expect(summary.verdict).toBe("FAIL");
    expect(summary.checks).toEqual([
      { key: "clarity", ok: false, note: "vague", estimated: null },
      { key: "safety", ok: null, note: "", estimated: null },
    ]);
    expect(summary.fixSuggestion).toBe("Reword");
    expect(reviewSummary(undefined).checks).toEqual([]);
  });
});
