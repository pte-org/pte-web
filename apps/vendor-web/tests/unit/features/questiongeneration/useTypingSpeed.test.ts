import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readTypingSpeed,
  storeTypingSpeed,
} from "../../../../features/questiongeneration/hooks/useTypingSpeed";
import {
  DEFAULT_TYPING_SPEED,
  TYPING_SPEED_STORAGE_KEY,
} from "../../../../features/questiongeneration/typingConstants";

describe("typing speed storage", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("falls back to the default for a missing or unknown stored value", () => {
    expect(readTypingSpeed()).toBe(DEFAULT_TYPING_SPEED);
    store.set(TYPING_SPEED_STORAGE_KEY, "warp");
    expect(readTypingSpeed()).toBe(DEFAULT_TYPING_SPEED);
  });

  it("remembers the picked pace", () => {
    storeTypingSpeed("slow");
    expect(store.get(TYPING_SPEED_STORAGE_KEY)).toBe("slow");
    expect(readTypingSpeed()).toBe("slow");
  });

  it("uses the default when storage is blocked", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
      },
    });
    expect(readTypingSpeed()).toBe(DEFAULT_TYPING_SPEED);
  });
});
