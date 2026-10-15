import { ApiError } from "@pte/api-client";
import { describe, expect, it } from "vitest";
import { getExamMutationErrorMessage } from "./examMutationError";

const translate = (key: string, fallback?: string): string => {
  const messages: Record<string, string> = {
    "tenant.examDetails.templateNotActive":
      "Mẫu đề đã chọn chưa hoạt động. Hãy chọn một mẫu đề đang hoạt động rồi thử lại.",
    "tenant.examDetails.lockdownModeInvalid": "Chính sách bảo mật không tương thích.",
    "tenant.examDetails.saveFailed": "Không thể lưu thông tin kỳ thi.",
  };
  return messages[key] ?? fallback ?? key;
};

describe("getExamMutationErrorMessage", () => {
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
