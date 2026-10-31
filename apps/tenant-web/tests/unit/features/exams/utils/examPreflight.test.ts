import { describe, expect, it, vi } from "vitest";
vi.mock(
  "@/features/examoperations/errorMessage",
  () => import("../../../../../features/examoperations/errorMessage"),
);
import {
  ExamPreflightBlockedError,
  composePreflightMessage,
} from "../../../../../features/exams/utils/examPreflight";

describe("preflight failure details", () => {
  it("keeps the conflicting exam name from audience preflight", () => {
    const error = new ExamPreflightBlockedError(
      ["AUDIENCE_CONFLICT_BLOCKED"],
      [],
      [
        {
          studentPublicId: "student-1",
          status: "EXCLUDED",
          reason: "SCHEDULE_OVERLAP",
          sourceSummary: "STUDENT:student-1",
          priorSessionPublicId: "exam-1",
          priorSessionName: "Thi sáng",
          priorStatus: "SCHEDULED",
        },
      ],
    );
    expect(error.conflicts).toEqual([
      {
        studentPublicId: "student-1",
        conflictingSessionPublicId: "exam-1",
        conflictingSessionName: "Thi sáng",
      },
    ]);
  });
  it("retains the implicit introduction shortage for the common error toast", () => {
    const error = new ExamPreflightBlockedError(
      ["TEMPLATE_POOL_INSUFFICIENT"],
      [
        {
          taskType: "PERSONAL_INTRODUCTION",
          section: "SPEAKING",
          required: 1,
          available: 0,
          ready: false,
          reason: "INSUFFICIENT_POOL",
        },
        {
          taskType: "READ_ALOUD",
          section: "SPEAKING",
          required: 7,
          available: 10,
          ready: true,
          reason: null,
        },
      ],
    );
    expect(error.shortages).toHaveLength(1);
    expect(error.shortages[0]).toMatchObject({
      taskType: "PERSONAL_INTRODUCTION",
      required: 1,
      available: 0,
    });
    expect(error.issues).toEqual(["TEMPLATE_POOL_INSUFFICIENT"]);
  });

  it("keeps a safe summary for unknown preflight issue codes", () => {
    expect(
      composePreflightMessage("Review the exam.", ["UNKNOWN_INTERNAL_CODE"], () => undefined),
    ).toBe("Review the exam.");
  });
});
