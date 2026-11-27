import { describe, expect, it } from "vitest";
import { diffAuditState } from "../../../../features/auditLog/utils/diffAuditState";

describe("diffAuditState", () => {
  it("reports only the leaves that changed", () => {
    const diff = diffAuditState(
      { promptText: "Old", cefrLevel: "B2" },
      { promptText: "New", cefrLevel: "B2" },
    );

    expect(diff.truncated).toBe(false);
    expect(diff.changes).toEqual([
      { path: ["promptText"], kind: "changed", before: "Old", after: "New" },
    ]);
  });

  it("walks nested objects and array positions", () => {
    const diff = diffAuditState(
      {
        options: [
          { text: "A", correct: true },
          { text: "B", correct: false },
        ],
      },
      {
        options: [
          { text: "A", correct: false },
          { text: "B", correct: true },
        ],
      },
    );

    expect(diff.changes.map((change) => change.path)).toEqual([
      ["options", 0, "correct"],
      ["options", 1, "correct"],
    ]);
  });

  it("marks list growth and shrinkage as added and removed", () => {
    const grown = diffAuditState({ items: ["RA"] }, { items: ["RA", "WE"] });
    const shrunk = diffAuditState({ items: ["RA", "WE"] }, { items: ["RA"] });

    expect(grown.changes).toEqual([
      { path: ["items", 1], kind: "added", before: null, after: "WE" },
    ]);
    expect(shrunk.changes).toEqual([
      { path: ["items", 1], kind: "removed", before: "WE", after: null },
    ]);
  });

  it("treats a missing side as a creation or a deletion", () => {
    expect(diffAuditState(null, { name: "Plan" }).changes).toEqual([
      { path: ["name"], kind: "added", before: null, after: "Plan" },
    ]);
    expect(diffAuditState({ name: "Plan" }, null).changes).toEqual([
      { path: ["name"], kind: "removed", before: "Plan", after: null },
    ]);
  });

  it("ignores null versus missing and stops at a truncation marker", () => {
    expect(diffAuditState({ hint: null }, {}).changes).toEqual([]);
    expect(diffAuditState({ truncated: true, preview: "{" }, { name: "x" })).toEqual({
      changes: [],
      truncated: true,
    });
  });
});
