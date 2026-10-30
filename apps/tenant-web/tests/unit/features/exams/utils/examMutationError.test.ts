import { ApiError } from "@pte/api-client";
import { describe, expect, it } from "vitest";
import { getExamMutationErrorMessage } from "../../../../../features/exams/utils/examMutationError";

const translate = (key: string, fallback?: string): string => {
  const messages: Record<string, string> = {
    "tenant.examDetails.templateNotActive":
      "Mẫu đề đã chọn chưa hoạt động. Hãy chọn một mẫu đề đang hoạt động rồi thử lại.",
    "tenant.examDetails.lockdownModeInvalid": "Chính sách bảo mật không tương thích.",
    "tenant.examDetails.saveFailed": "Không thể lưu thông tin kỳ thi.",
    "tenant.examConflict.audience": "Tất cả học viên đã chọn đều trùng lịch với kỳ thi khác.",
    "tenant.examConflict.sessions": "Kỳ thi bị trùng: {exams}.",
  };
  return messages[key] ?? fallback ?? key;
};

describe("getExamMutationErrorMessage", () => {
  it("shows the name for a single conflicting exam returned by scheduling", () => {
    const error = new ApiError(
      "conflict",
      409,
      "SESSION_TIME_CONFLICT",
      {
        data: { conflictingSessionPublicId: "exam-1", conflictingSessionName: "Thi sáng" },
      },
      { code: "SESSION_TIME_CONFLICT" },
    );
    expect(getExamMutationErrorMessage(error, translate)).toContain("Thi sáng");
  });
  it("localizes audience conflicts and lists each conflicting exam once", () => {
    const error = new ApiError(
      "conflict",
      409,
      "EXAM_AUDIENCE_CONFLICT",
      {
        data: [
          {
            studentPublicId: "student-1",
            conflictingSessionPublicId: "exam-1",
            conflictingSessionName: "Thi sáng",
          },
          {
            studentPublicId: "student-2",
            conflictingSessionPublicId: "exam-1",
            conflictingSessionName: "Thi sáng",
          },
          {
            studentPublicId: "student-3",
            conflictingSessionPublicId: "exam-2",
            conflictingSessionName: "Thi chiều",
          },
        ],
      },
      {
        code: "EXAM_AUDIENCE_CONFLICT",
        userMessage: "Every eligible student conflicts with another exam.",
      },
    );
    expect(getExamMutationErrorMessage(error, translate)).toBe(
      "Tất cả học viên đã chọn đều trùng lịch với kỳ thi khác. Kỳ thi bị trùng: Thi sáng; Thi chiều.",
    );
  });

  it("keeps a localized summary when the server does not send conflict details", () => {
    const error = new ApiError(
      "conflict",
      409,
      "EXAM_AUDIENCE_CONFLICT",
      { data: null },
      { code: "EXAM_AUDIENCE_CONFLICT" },
    );
    expect(getExamMutationErrorMessage(error, translate)).toBe(
      "Tất cả học viên đã chọn đều trùng lịch với kỳ thi khác.",
    );
  });
  it("localizes an inactive exam template error", () => {
    const error = new ApiError(
      "conflict",
      409,
      "The selected exam template is not active. Choose an active template and try again.",
      undefined,
      { code: "TEMPLATE_NOT_ACTIVE" },
    );

    expect(getExamMutationErrorMessage(error, translate)).toBe(
      "Mẫu đề đã chọn chưa hoạt động. Hãy chọn một mẫu đề đang hoạt động rồi thử lại.",
    );
  });

  it("localizes the lockdown policy error", () => {
    const error = new ApiError(
      "conflict",
      409,
      "The selected lockdown mode is not allowed for this exam mode.",
      undefined,
      { code: "LOCKDOWN_MODE_INVALID_FOR_EXAM_MODE" },
    );

    expect(getExamMutationErrorMessage(error, translate)).toBe(
      "Chính sách bảo mật không tương thích.",
    );
  });

  it("uses the localized generic fallback for an unknown error", () => {
    expect(getExamMutationErrorMessage(new Error("unexpected"), translate)).toBe(
      "Không thể lưu thông tin kỳ thi.",
    );
  });
});
