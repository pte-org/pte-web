import { describe, expect, it } from "vitest";
import { ApiError } from "../../../src/client/apiError";
import { getUserFacingApiErrorMessage } from "../../../src/client/errorMessage";

const conflict = (code: string): ApiError => new ApiError("conflict", 409, "Conflict", null, { code });
const badRequest = (code: string): ApiError => new ApiError("validation", 400, "Bad request", null, { code });

describe("credential change error messages", () => {
  it("tells the Host a Student is mid-exam instead of showing the generic conflict text", () => {
    const message = getUserFacingApiErrorMessage(conflict("STUDENT_ATTEMPT_IN_PROGRESS"));

    expect(message).toMatch(/taking an exam|mid-exam|in an exam/i);
    expect(message).not.toMatch(/conflicts with the current data/i);
  });

  it("explains an invalid or expired reset link without saying which", () => {
    const message = getUserFacingApiErrorMessage(badRequest("INVALID_PASSWORD_RESET_TOKEN"));

    expect(message).toMatch(/invalid|expired/i);
    expect(message).toMatch(/new link|request/i);
  });
});
