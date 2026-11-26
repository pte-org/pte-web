import { describe, expect, it } from "vitest";
import { revealedChars } from "../../../../features/questiongeneration/utils/typingStep";

describe("revealedChars", () => {
  it("writes the same amount for the same time, whatever the frame rate was", () => {
    expect(revealedChars(1000, 30, 500)).toBe(30);
    expect(revealedChars(2500, 15, 500)).toBe(37);
  });

  it("writes nothing at the start and never past the end of the text", () => {
    expect(revealedChars(0, 30, 500)).toBe(0);
    expect(revealedChars(-50, 30, 500)).toBe(0);
    expect(revealedChars(60_000, 60, 120)).toBe(120);
  });
});
