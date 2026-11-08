import { describe, expect, it } from "vitest";
import {
  AI_ADMIN_COPY,
  FAILURE_LABELS,
} from "../../../../features/aiadmin/constants";
import {
  failureLabel,
  fill,
} from "../../../../features/aiadmin/utils/presentation";

describe("failureLabel", () => {
  it("explains a known code in the requested language", () => {
    expect(failureLabel("GENERATION_REVIEW_FAILED", "en")).toBe("Reviewer rejected the draft");
    expect(failureLabel("GENERATION_REVIEW_FAILED", "vi")).toBe("Reviewer từ chối bản nháp");
  });

  it("shows an unknown code as is so it can still be searched for", () => {
    expect(failureLabel("GENERATION_SOMETHING_NEW", "vi")).toBe("GENERATION_SOMETHING_NEW");
  });

  it("covers the same codes in both languages", () => {
    expect(Object.keys(FAILURE_LABELS.vi).sort()).toEqual(Object.keys(FAILURE_LABELS.en).sort());
  });
});

describe("copy", () => {
  it("has the same keys in English and Vietnamese, none empty", () => {
    expect(Object.keys(AI_ADMIN_COPY.vi).sort()).toEqual(Object.keys(AI_ADMIN_COPY.en).sort());
    for (const copy of [AI_ADMIN_COPY.en, AI_ADMIN_COPY.vi]) {
      for (const [key, value] of Object.entries(copy)) {
        expect(value.trim(), key).not.toBe("");
      }
    }
  });
});

describe("fill", () => {
  it("replaces every occurrence of a placeholder", () => {
    expect(fill("{days} days, {days} again", { days: 30 })).toBe("30 days, 30 again");
  });
});
