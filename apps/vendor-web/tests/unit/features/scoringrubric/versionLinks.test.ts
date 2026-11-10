import { describe, expect, it } from "vitest";
import { RUBRIC_VERSION_PARAM, scoringRubricDetailHref } from "../../../../features/scoringrubric/constants";
import { RUBRIC_EDIT_TEXT, versionDetailHref, versionEditHref } from "../../../../features/scoringrubric/versionConstants";
import { statusLabel, statusVariant } from "../../../../features/scoringrubric/versionStatus";

describe("rubric links", () => {
  it("opens a version to read and, separately, to edit", () => {
    expect(versionDetailHref("abc")).toBe("/admin/scoring-rubric/versions/abc");
    expect(versionEditHref("abc")).toBe("/admin/scoring-rubric/versions/abc/edit");
  });

  it("opens a task type on the active rubric, or on a chosen version", () => {
    expect(scoringRubricDetailHref("READ_ALOUD")).toBe("/admin/scoring-rubric/READ_ALOUD");
    expect(scoringRubricDetailHref("READ_ALOUD", "v 1")).toBe(`/admin/scoring-rubric/READ_ALOUD?${RUBRIC_VERSION_PARAM}=v%201`);
  });
});

describe("version status", () => {
  it("is shown in words and with a colour, and an unknown status as it is", () => {
    expect(statusLabel("ACTIVE", RUBRIC_EDIT_TEXT.vi)).toBe("Đang hiệu lực");
    expect(statusLabel("DRAFT", RUBRIC_EDIT_TEXT.en)).toBe("Draft");
    expect(statusLabel("SOMETHING", RUBRIC_EDIT_TEXT.vi)).toBe("SOMETHING");
    expect(statusVariant("ACTIVE")).toBe("success");
    expect(statusVariant("DRAFT")).toBe("warning");
    expect(statusVariant("SOMETHING")).toBe("neutral");
  });
});
