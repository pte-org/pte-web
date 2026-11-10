import { describe, expect, it } from "vitest";
import { translateAdminText } from "../../../../features/i18n/adminCopy";
import {
  FORGOT_PASSWORD_TEXT,
  PASSWORD_RESET_LINKS,
  RESET_PASSWORD_TEXT,
} from "../../../../features/auth/constants";

/** Words that read the same in both languages. */
const SAME_IN_VIETNAMESE = new Set(["Email"]);

const strings = (): string[] =>
  [FORGOT_PASSWORD_TEXT, RESET_PASSWORD_TEXT, PASSWORD_RESET_LINKS].flatMap((group) =>
    Object.values(group).filter((value): value is string => typeof value === "string"),
  );

describe("forgot and reset password copy", () => {
  it("has a Vietnamese translation for every string, so the language switch on these pages is not half-working", () => {
    const missing = strings().filter(
      (text) => !SAME_IN_VIETNAMESE.has(text) && translateAdminText(text, "vi") === text,
    );

    expect(missing).toEqual([]);
  });

  it("leaves the English text alone", () => {
    for (const text of strings()) {
      expect(translateAdminText(text, "en")).toBe(text);
    }
  });
});
