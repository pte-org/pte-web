import { describe, expect, it } from "vitest";
import { ApiError } from "@pte/api-client";
import { programErrorMessage } from "../../../../features/programs/utils/programErrorMessage";

const VI_MESSAGES = {
  nameAlreadyUsed: "Tên chương trình đã tồn tại trong tổ chức này.",
  programNotFound: "Không tìm thấy chương trình đã chọn hoặc chương trình không còn hoạt động.",
  organizationNotFound: "Không tìm thấy tổ chức đã chọn.",
  network: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
  generic: "Không thể thực hiện thao tác. Vui lòng thử lại.",
  nameRequired: "Vui lòng nhập tên chương trình.",
  endDateBeforeStartDate: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.",
};

describe("programErrorMessage", () => {
  it("returns undefined when error is falsy", () => {
    expect(programErrorMessage(null, "vi", VI_MESSAGES)).toBeUndefined();
    expect(programErrorMessage(undefined, "vi", VI_MESSAGES)).toBeUndefined();
  });

  it("translates PROGRAM_NAME_ALREADY_USED in Vietnamese", () => {
    const error = new ApiError("conflict", 409, "PROGRAM_NAME_ALREADY_USED", undefined, {
      code: "PROGRAM_NAME_ALREADY_USED",
    });

    expect(programErrorMessage(error, "vi", VI_MESSAGES)).toBe(
      "Tên chương trình đã tồn tại trong tổ chức này.",
    );
  });

  it("uses shared English catalog when locale is en", () => {
    const error = new ApiError("conflict", 409, "PROGRAM_NAME_ALREADY_USED", undefined, {
      code: "PROGRAM_NAME_ALREADY_USED",
    });

    expect(programErrorMessage(error, "en", VI_MESSAGES)).toBe(
      "A program with this name already exists in your organization.",
    );
  });

  it("translates backend validation messages in Vietnamese", () => {
    const dateError = new ApiError("validation", 400, "End date must be on or after start date");
    const nameError = new ApiError("validation", 400, "Program name is required");

    expect(programErrorMessage(dateError, "vi", VI_MESSAGES)).toBe(
      "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.",
    );
    expect(programErrorMessage(nameError, "vi", VI_MESSAGES)).toBe(
      "Vui lòng nhập tên chương trình.",
    );
  });

  it("translates network errors in Vietnamese", () => {
    const error = new ApiError("network", 0, "Failed to fetch");
    expect(programErrorMessage(error, "vi", VI_MESSAGES)).toBe(VI_MESSAGES.network);
  });
});
