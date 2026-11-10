import { describe, expect, it } from "vitest";
import {
  actionFor,
  columnOf,
  moveVerdict,
  needsReviewerRole,
} from "../../../../features/examstudio/kanbanTransitions";
import type { Question, QuestionStatus } from "../../../../features/questionbank/types";

const question = (status: QuestionStatus, overrides: Partial<Question> = {}): Question => ({
  id: status,
  skill: "speaking",
  taskType: "READ_ALOUD",
  content: "Urban gardens",
  status,
  pool: "exam",
  ...overrides,
});

describe("kanban lifecycle", () => {
  it("puts each status in its column", () => {
    expect(columnOf(question("draft"))).toBe("draft");
    expect(columnOf(question("pending_approval"))).toBe("pending");
    expect(columnOf(question("published"))).toBe("approved");
    expect(columnOf(question("archived"))).toBe("archived");
  });

  it("allows only the next step of the lifecycle", () => {
    expect(actionFor(question("draft"), "pending")).toBe("submit");
    expect(actionFor(question("pending_approval"), "approved")).toBe("approve");
    expect(actionFor(question("published"), "archived")).toBe("archive");
  });

  it("refuses skipping, going back and staying put", () => {
    expect(actionFor(question("draft"), "approved")).toBeNull();
    expect(actionFor(question("pending_approval"), "draft")).toBeNull();
    expect(actionFor(question("published"), "published" as never)).toBeNull();
    expect(actionFor(question("archived"), "approved")).toBeNull();
  });

  it("refuses to archive a question the server says cannot be archived", () => {
    expect(actionFor(question("published", { canArchive: false }), "archived")).toBeNull();
    expect(actionFor(question("published", { canArchive: true }), "archived")).toBe("archive");
  });

  it("asks for the reviewer role only to approve", () => {
    expect(needsReviewerRole("approve")).toBe(true);
    expect(needsReviewerRole("submit")).toBe(false);
  });
});

describe("moveVerdict", () => {
  it("lets anyone submit a draft for review", () => {
    expect(moveVerdict(question("draft"), "pending", false)).toBe("allowed");
  });

  it("lets only a reviewer approve", () => {
    expect(moveVerdict(question("pending_approval"), "approved", false)).toBe("needs-reviewer");
    expect(moveVerdict(question("pending_approval"), "approved", true)).toBe("allowed");
  });

  it("says a move is not a step whatever the role", () => {
    expect(moveVerdict(question("draft"), "approved", true)).toBe("not-a-step");
    expect(moveVerdict(question("archived"), "approved", true)).toBe("not-a-step");
  });
});

