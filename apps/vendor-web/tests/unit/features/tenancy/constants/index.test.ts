import { describe, expect, it } from "vitest";
import { formatSuspensionDuration } from "../../../../../features/tenancy/constants/index";

describe("formatSuspensionDuration", () => {
  it("keeps the complete suspension loss duration", () => {
    expect(formatSuspensionDuration(86_400 + 7_200 + 180 + 4)).toBe(
      "1 day(s) 2 hour(s) 3 minute(s) 4 second(s)",
    );
  });

  it("does not expose negative duration", () => {
    expect(formatSuspensionDuration(-1)).toBe("0 day(s) 0 hour(s) 0 minute(s) 0 second(s)");
  });
});
