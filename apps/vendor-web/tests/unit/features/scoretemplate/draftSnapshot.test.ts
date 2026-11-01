import { describe, expect, it } from "vitest";
import { createDraftSnapshot } from "../../../../features/scoretemplate/draftSnapshot";
import type { ScoreTemplateItemDraft } from "../../../../features/scoretemplate/types";

const item = (overrides: Partial<ScoreTemplateItemDraft> = {}): ScoreTemplateItemDraft => ({
  taskType: "READ_ALOUD",
  taskTypeKey: "READ_ALOUD",
  section: "SPEAKING",
  sequence: 1,
  minCount: "6",
  maxCount: "7",
  prepSeconds: "35",
  responseSeconds: "40",
  overallWeight: "2.23",
  speakingWeight: "8.91",
  writingWeight: "0",
  readingWeight: "0",
  listeningWeight: "0",
  ...overrides,
});

const snapshot = (name = "PTE", items = [item()]): string => createDraftSnapshot(name, items);

describe("createDraftSnapshot", () => {
  it("is equal for equal content, even from separate objects", () => {
    expect(snapshot()).toBe(snapshot());
  });

  it("changes when the name changes", () => {
    expect(snapshot("PTE 2")).not.toBe(snapshot("PTE"));
  });

  it("changes when a field of a row changes", () => {
    expect(snapshot("PTE", [item({ maxCount: "8" })])).not.toBe(snapshot());
  });

  it("changes when rows are added, removed or reordered", () => {
    const other = item({ taskTypeKey: "REPEAT_SENTENCE", taskType: "REPEAT_SENTENCE", sequence: 2 });
    expect(snapshot("PTE", [item(), other])).not.toBe(snapshot());
    expect(snapshot("PTE", [])).not.toBe(snapshot());
    expect(snapshot("PTE", [item(), other])).not.toBe(snapshot("PTE", [other, item()]));
  });

  it("returns to the saved snapshot when an edit is undone", () => {
    const saved = snapshot();
    expect(snapshot("PTE", [item({ maxCount: "9" })])).not.toBe(saved);
    expect(snapshot("PTE", [item({ maxCount: "7" })])).toBe(saved);
  });
});
