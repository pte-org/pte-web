import { describe, expect, it } from "vitest";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { applyLiveEvent, followedIndex, laneStatus, reachedLane } from "../../../../features/questiongeneration/utils/liveItems";
import { draftFields } from "../../../../features/questiongeneration/utils/draftFields";
import { reviewSummary } from "../../../../features/questiongeneration/utils/reviewSummary";

const item = (over: Partial<QuestionGenerationLiveItem>): QuestionGenerationLiveItem => ({
  index: 0, stage: null, activeAgent: null, generator: null, reviewer: null, audioRef: null, imageRef: null, ...over,
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

  it("lets a snapshot replace what was known and keeps the items apart", () => {
    const before = applyLiveEvent({}, { type: "token", index: 3, agent: "REVIEWER", delta: "x" });
    const after = applyLiveEvent(before, { type: "snapshot", finished: false, items: [item({ index: 1, stage: "REVIEWING" })] });
    expect(Object.keys(after)).toEqual(["1"]);
    expect(applyLiveEvent(after, { type: "stage", index: 2, stage: "GENERATING" })[1]).toBe(after[1]);
  });

  it("records media and ignores events that carry no state", () => {
    const items = applyLiveEvent({}, { type: "media", index: 0, audioRef: "a1", imageRef: null });
    expect(items[0].audioRef).toBe("a1");
    expect(applyLiveEvent(items, { type: "item", index: 0 })).toBe(items);
  });
});

describe("laneStatus", () => {
  it("marks the agent that runs, the steps before it done and the ones after waiting", () => {
    const reviewing = item({ stage: "REVIEWING", activeAgent: "REVIEWER" });
    expect(laneStatus("GENERATOR", reviewing, null, null)).toBe("done");
    expect(laneStatus("REVIEWER", reviewing, null, null)).toBe("active");
    expect(laneStatus("AUDIO", reviewing, null, null)).toBe("waiting");
  });

  it("shows the writer running again while a rejected draft is rewritten", () => {
    const rewriting = item({ stage: "REVIEWING", activeAgent: "GENERATOR" });
    expect(laneStatus("GENERATOR", rewriting, null, null)).toBe("active");
    expect(laneStatus("REVIEWER", rewriting, null, null)).toBe("waiting");
  });

  it("marks a saved item done and a failed one at the step it stopped", () => {
    expect(laneStatus("SAVE", undefined, "SAVED", null)).toBe("done");
    expect(laneStatus("REVIEWER", undefined, "FAILED", "REVIEWER")).toBe("failed");
    expect(laneStatus("GENERATOR", undefined, "FAILED", "REVIEWER")).toBe("done");
    expect(laneStatus("AUDIO", undefined, "FAILED", "REVIEWER")).toBe("waiting");
    expect(laneStatus("REVIEWER", undefined, "CANCELLED", "REVIEWER")).toBe("waiting");
  });
});

describe("reachedLane", () => {
  it("reads where an item stopped from its stage and the review", () => {
    expect(reachedLane(item({ stage: "GENERATING" }), false)).toBe("GENERATOR");
    expect(reachedLane(item({ stage: "REVIEWING" }), false)).toBe("REVIEWER");
    expect(reachedLane(item({ stage: "REVIEWING" }), true)).toBe("SAVE");
    expect(reachedLane(item({ stage: "RENDERING_MEDIA" }), true)).toBe("AUDIO");
    expect(reachedLane(undefined, false)).toBeNull();
  });
});

describe("followedIndex", () => {
  it("follows the item being made, else the last one started", () => {
    expect(followedIndex([{ index: 0, stage: "SAVED" }, { index: 1, stage: "REVIEWING" }, { index: 2, stage: "QUEUED" }])).toBe(1);
    expect(followedIndex([{ index: 0, stage: "SAVED" }, { index: 1, stage: "FAILED" }])).toBe(1);
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
    expect(draftFields({ slots: [{ answer: "cat" }] })[0].value)
      .toEqual({ kind: "records", records: [[{ key: "answer", text: "cat" }]] });
    expect(draftFields(undefined)).toEqual([]);
  });
});

describe("reviewSummary", () => {
  it("lists the checks written so far and the verdict", () => {
    const summary = reviewSummary({ verdict: "FAIL", checks: { clarity: { ok: false, note: "vague" }, safety: {} }, fixSuggestion: "Reword" });
    expect(summary.verdict).toBe("FAIL");
    expect(summary.checks).toEqual([
      { key: "clarity", ok: false, note: "vague", estimated: null },
      { key: "safety", ok: null, note: "", estimated: null },
    ]);
    expect(summary.fixSuggestion).toBe("Reword");
    expect(reviewSummary(undefined).checks).toEqual([]);
  });
});
