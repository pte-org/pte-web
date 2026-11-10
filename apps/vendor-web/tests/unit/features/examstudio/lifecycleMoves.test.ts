import { describe, expect, it } from "vitest";
import {
  taskTypeMove,
  taskTypeVerdict,
  templateMove,
  templateVerdict,
} from "../../../../features/examstudio/lifecycleMoves";

describe("templateMove", () => {
  it("lets a draft go to review and nowhere else", () => {
    expect(templateMove("DRAFT", "PENDING_APPROVAL")).toBe("submit");
    expect(templateMove("DRAFT", "ACTIVE")).toBeNull();
    expect(templateMove("DRAFT", "RETIRED")).toBeNull();
  });

  it("lets a reviewer return a submission or approve it into use", () => {
    expect(templateMove("PENDING_APPROVAL", "DRAFT")).toBe("return");
    expect(templateMove("PENDING_APPROVAL", "ACTIVE")).toBe("approve-activate");
    expect(templateMove("PENDING_APPROVAL", "RETIRED")).toBeNull();
  });

  it("switches an older version back on, but never retires the active one by hand", () => {
    expect(templateMove("RETIRED", "ACTIVE")).toBe("activate");
    expect(templateMove("ACTIVE", "RETIRED")).toBeNull();
    expect(templateMove("ACTIVE", "DRAFT")).toBeNull();
  });

  it("does not move a card onto its own column", () => {
    expect(templateMove("DRAFT", "DRAFT")).toBeNull();
  });
});

describe("templateVerdict", () => {
  it("lets anyone submit a draft but keeps the other steps to reviewers", () => {
    expect(templateVerdict("DRAFT", "PENDING_APPROVAL", false)).toBe("allowed");
    expect(templateVerdict("PENDING_APPROVAL", "ACTIVE", false)).toBe("needs-reviewer");
    expect(templateVerdict("PENDING_APPROVAL", "ACTIVE", true)).toBe("allowed");
    expect(templateVerdict("RETIRED", "ACTIVE", false)).toBe("needs-reviewer");
  });

  it("calls a move that has no step not-a-step whatever the role", () => {
    expect(templateVerdict("DRAFT", "ACTIVE", true)).toBe("not-a-step");
  });
});

describe("taskTypeMove", () => {
  it("follows draft, review, in use, retired", () => {
    expect(taskTypeMove("DRAFT", "PENDING_APPROVAL")).toBe("submit");
    expect(taskTypeMove("PENDING_APPROVAL", "ACTIVE")).toBe("approve");
    expect(taskTypeMove("ACTIVE", "RETIRED")).toBe("retire");
  });

  it("has no way back: a submission cannot be returned and a retired type cannot return", () => {
    expect(taskTypeMove("PENDING_APPROVAL", "DRAFT")).toBeNull();
    expect(taskTypeMove("RETIRED", "ACTIVE")).toBeNull();
    expect(taskTypeMove("DRAFT", "ACTIVE")).toBeNull();
  });
});

describe("taskTypeVerdict", () => {
  it("lets anyone submit, but approving and retiring need a reviewer", () => {
    expect(taskTypeVerdict("DRAFT", "PENDING_APPROVAL", false)).toBe("allowed");
    expect(taskTypeVerdict("PENDING_APPROVAL", "ACTIVE", false)).toBe("needs-reviewer");
    expect(taskTypeVerdict("ACTIVE", "RETIRED", true)).toBe("allowed");
  });
});
