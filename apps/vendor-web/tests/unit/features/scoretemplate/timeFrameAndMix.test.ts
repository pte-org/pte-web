import { describe, expect, it } from "vitest";
import {
  draftToTargets,
  isValidMix,
  mixToDraft,
  mixTotal,
} from "../../../../features/scoretemplate/cefrMix";
import {
  checkTimeFrame,
  draftToTimeFrame,
  formatMinutes,
  pearsonTimeFrameDraft,
  timeFrameToDraft,
} from "../../../../features/scoretemplate/timeFrame";

describe("time frame form", () => {
  it("starts from the Pearson window when the template has no frame", () => {
    expect(timeFrameToDraft(null)).toEqual(pearsonTimeFrameDraft());
    expect(pearsonTimeFrameDraft().totalMax).toBe("135");
  });

  it("shows a stored frame in minutes and saves it back in seconds", () => {
    const draft = timeFrameToDraft({
      speakingWritingMinSeconds: 4560,
      speakingWritingMaxSeconds: 5040,
      readingMinSeconds: 1380,
      readingMaxSeconds: 1800,
      listeningMinSeconds: 1860,
      listeningMaxSeconds: 2340,
      totalMaxSeconds: 8100,
    });

    expect(draft.speakingWritingMin).toBe("76");
    expect(draftToTimeFrame(draft).totalMaxSeconds).toBe(8100);
  });

  it("accepts the Pearson window", () => {
    expect(checkTimeFrame(pearsonTimeFrameDraft())).toBeNull();
  });

  it("rejects a blank or non-positive value", () => {
    expect(checkTimeFrame({ ...pearsonTimeFrameDraft(), readingMin: "" })).toEqual({
      kind: "not-a-number",
    });
    expect(checkTimeFrame({ ...pearsonTimeFrameDraft(), listeningMax: "0" })).toEqual({
      kind: "not-a-number",
    });
  });

  it("rejects a part whose minimum is above its maximum", () => {
    expect(
      checkTimeFrame({ ...pearsonTimeFrameDraft(), readingMin: "31", readingMax: "30" }),
    ).toEqual({ kind: "range", part: "reading" });
  });

  it("rejects a ceiling below the sum of the three minimums", () => {
    expect(checkTimeFrame({ ...pearsonTimeFrameDraft(), totalMax: "100" })).toEqual({
      kind: "total",
    });
  });

  it("formats seconds as minutes with one decimal", () => {
    expect(formatMinutes(4560)).toBe("76.0");
    expect(formatMinutes(1590)).toBe("26.5");
  });
});

describe("CEFR mix form", () => {
  it("starts from an even split of B1 to C2 when the template has none", () => {
    const draft = mixToDraft([]);

    expect(draft).toMatchObject({ A1: "", A2: "", B1: "25", B2: "25", C1: "25", C2: "25" });
    expect(isValidMix(draft)).toBe(true);
  });

  it("reads a stored mix and leaves out levels at 0 when saving", () => {
    const draft = mixToDraft([
      { level: "B1", percent: 40 },
      { level: "C1", percent: 60 },
    ]);

    expect(mixTotal(draft)).toBe(100);
    expect(draftToTargets(draft)).toEqual([
      { level: "B1", percent: 40 },
      { level: "C1", percent: 60 },
    ]);
  });

  it("is invalid unless the percents are whole and sum to 100", () => {
    expect(isValidMix({ ...mixToDraft([]), B1: "30" })).toBe(false);
    expect(isValidMix({ ...mixToDraft([]), B1: "24.5", B2: "25.5" })).toBe(false);
    expect(isValidMix({ ...mixToDraft([]), B1: "-5", B2: "55" })).toBe(false);
  });
});
