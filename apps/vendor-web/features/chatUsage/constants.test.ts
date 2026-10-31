import { describe, expect, it } from "vitest";
import { CHAT_USAGE_COPY, CHAT_USAGE_QUERY_KEY, CHAT_USAGE_RANGE_DAYS } from "./constants";

describe("chat usage copy", () => {
  it("has the same keys in English and Vietnamese, all non-empty", () => {
    expect(Object.keys(CHAT_USAGE_COPY.vi).sort()).toEqual(Object.keys(CHAT_USAGE_COPY.en).sort());
    for (const copy of [CHAT_USAGE_COPY.en, CHAT_USAGE_COPY.vi]) {
      for (const [key, value] of Object.entries(copy)) {
        expect(value.trim(), key).not.toBe("");
      }
    }
  });

  it("explains that the cost is an estimate and that the invoice is the real figure", () => {
    expect(CHAT_USAGE_COPY.en.ESTIMATE_NOTE).toMatch(/estimate/i);
    expect(CHAT_USAGE_COPY.vi.ESTIMATE_NOTE).toMatch(/ước tính/i);
  });

  it("tells an admin that a missing report usually means chat is switched off", () => {
    expect(CHAT_USAGE_COPY.en.LOAD_FAILED).toMatch(/chat/i);
    expect(CHAT_USAGE_COPY.vi.LOAD_FAILED).toMatch(/chat/i);
  });

  it("no longer mentions a cache, because answers are not cached", () => {
    for (const copy of [CHAT_USAGE_COPY.en, CHAT_USAGE_COPY.vi]) {
      expect(Object.keys(copy).filter((key) => key.includes("CACHE"))).toEqual([]);
    }
  });

  it("looks back thirty days by default and has its own cache key", () => {
    expect(CHAT_USAGE_RANGE_DAYS).toBe(30);
    expect(CHAT_USAGE_QUERY_KEY).toEqual(["chatUsage"]);
  });
});
