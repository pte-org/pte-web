import { describe, expect, it } from "vitest";
import { translateAdminText } from "../../../../features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT } from "../../../../features/scoretemplate/constants";

describe("score template weight copy is bilingual", () => {
  it.each([
    SCORE_TEMPLATE_TEXT.WEIGHT_TOTALS_LABEL,
    SCORE_TEMPLATE_TEXT.WEIGHT_TOTAL_MISMATCH,
    "Speaking",
    "Writing",
    "Reading",
    "Listening",
  ])("translates %s to Vietnamese", (text) => {
    expect(translateAdminText(text, "vi")).not.toBe(text);
    expect(translateAdminText(text, "en")).toBe(text);
  });
});
