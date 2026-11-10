import { describe, expect, it } from "vitest";
import { nextAction } from "../../../../features/examstudio/nextAction";

const draft = { editable: true, isReady: false, missingQuestions: 0, hasOtherDraft: false };

describe("nextAction", () => {
  it("sends a locked version to its draft, or offers to make one", () => {
    expect(nextAction({ ...draft, editable: false, hasOtherDraft: true })).toBe("switch-to-draft");
    expect(nextAction({ ...draft, editable: false })).toBe("create-draft");
  });

  it("offers to activate a draft that is ready", () => {
    expect(nextAction({ ...draft, isReady: true })).toBe("activate");
  });

  it("offers to write questions when a draft is short of them", () => {
    expect(nextAction({ ...draft, missingQuestions: 4 })).toBe("write-questions");
  });

  it("offers nothing when the only gap is task types outside the template", () => {
    expect(nextAction(draft)).toBeNull();
  });
});
