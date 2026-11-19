import { describe, expect, it } from "vitest";
import type { Question } from "../../../../features/questionbank/types";
import { nextQuickStep } from "../../../../features/examstudio/kanbanTransitions";

// Only the fields the lifecycle rule reads are filled in.
const question = (status: string, extra: Partial<Question> = {}): Question => ({ status, ...extra }) as unknown as Question;

describe("quick lifecycle button on a board card", () => {
  it("submits a draft for any author", () => {
    expect(nextQuickStep(question("draft"), false)).toBe("pending");
  });

  it("approves a pending question only for a reviewer", () => {
    expect(nextQuickStep(question("pending_approval"), true)).toBe("approved");
    expect(nextQuickStep(question("pending_approval"), false)).toBeNull();
  });

  it("archives an approved question only when it may be archived", () => {
    expect(nextQuickStep(question("published", { canArchive: true }), true)).toBe("archived");
    expect(nextQuickStep(question("published", { canArchive: false }), true)).toBeNull();
  });

  it("offers nothing for an archived question", () => {
    expect(nextQuickStep(question("archived"), true)).toBeNull();
  });
});
