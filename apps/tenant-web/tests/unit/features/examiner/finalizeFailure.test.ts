import { describe, expect, it } from "vitest";
import { ApiError } from "@pte/api-client";
import { EXAMINER_WORK_TEXT_VI } from "../../../../features/examiner/messages/workVi";
import { getFinalizeFailureText } from "../../../../features/examiner/utils/finalizeFailure";

const ids = ["id-1", "id-2", "id-3", "id-4"];
const rejected = (message: string, kind: "validation" | "conflict" = "validation") =>
  new ApiError(kind, kind === "validation" ? 400 : 409, message);

describe("getFinalizeFailureText", () => {
  it("names the unmarked question", () => {
    const text = getFinalizeFailureText(rejected("Missing complete draft for answer id-4"), EXAMINER_WORK_TEXT_VI, ids);
    expect(text).toBe("Câu 4 chưa được chấm. Hãy chấm và lưu tất cả các câu rồi chốt lại.");
  });
  it("explains stale versions and an unstarted attempt", () => {
    const reason = (message: string) => getFinalizeFailureText(rejected(message, "conflict"), EXAMINER_WORK_TEXT_VI, ids);
    expect(reason("Draft version mismatch for answer id-2")).toContain("Điểm câu 2 đã thay đổi");
    expect(reason("Expected work version mismatch: expected 3 but was 4")).toContain("đã bị thay đổi ở nơi khác");
    expect(reason("Work must be started before finalization")).toBe(EXAMINER_WORK_TEXT_VI.FINALIZE_NOT_STARTED);
  });
  it("falls back to the generic message for anything unrecognised", () => {
    expect(getFinalizeFailureText(rejected("Something else"), EXAMINER_WORK_TEXT_VI, ids)).toBe(EXAMINER_WORK_TEXT_VI.FINALIZE_FAILED);
    expect(getFinalizeFailureText(new Error("boom"), EXAMINER_WORK_TEXT_VI, ids)).toBe(EXAMINER_WORK_TEXT_VI.FINALIZE_FAILED);
  });
  it("tells a lost connection apart", () => {
    const offline = new ApiError("network", 0, "offline");
    expect(getFinalizeFailureText(offline, EXAMINER_WORK_TEXT_VI, ids)).toBe(EXAMINER_WORK_TEXT_VI.FINALIZE_FAILED_NETWORK);
  });
});
