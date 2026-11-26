import { describe, expect, it } from "vitest";
import { inboxBadgeVariant } from "../../../src/components/inboxCategoryVariant";

describe("inboxBadgeVariant", () => {
  it("gives each kind of notification its own colour", () => {
    expect(inboxBadgeVariant({ category: "SYSTEM_NOTICE", importance: "INFO" })).toBe("info");
    expect(inboxBadgeVariant({ category: "BILLING", importance: "INFO" })).toBe("success");
    expect(inboxBadgeVariant({ category: "SUPPORT", importance: "INFO" })).toBe("warning");
  });

  it("leaves a category without a colour neutral", () => {
    expect(inboxBadgeVariant({ category: "SESSION", importance: "INFO" })).toBe("neutral");
  });

  it("lets an important notification stand out whatever its category", () => {
    expect(inboxBadgeVariant({ category: "SYSTEM_NOTICE", importance: "IMPORTANT" })).toBe("warning");
  });
});
