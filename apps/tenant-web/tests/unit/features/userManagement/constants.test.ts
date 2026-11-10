import { describe, expect, it } from "vitest";
import { USER_MANAGEMENT_TEXT } from "@/features/userManagement/constants";

describe("features/userManagement/constants", () => {
  it("exports expected text constants and template functions", () => {
    expect(USER_MANAGEMENT_TEXT.ACCOUNT_DETAILS_TITLE).toBe("Account details");
    expect(USER_MANAGEMENT_TEXT.USERNAME).toBe("Username");
    expect(USER_MANAGEMENT_TEXT.EMAIL_DELIVERY("user@test.com")).toContain("user@test.com");
    expect(USER_MANAGEMENT_TEXT.NO_EMAIL_DELIVERY).toContain("without email delivery");
  });
});
