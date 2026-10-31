import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  refs: [] as { current: unknown }[],
  cursor: 0,
  effects: [] as (() => void)[],
  showToast: vi.fn(),
  mapError: vi.fn((_error: unknown, fallback: string) => fallback),
}));

// Run every effect again on each render, including Strict Mode's effect replay.
// Persistent refs model the mounted hook without adding a DOM test dependency.
vi.mock("react", () => ({
  useRef: (initial: unknown) => {
    const index = state.cursor++;
    state.refs[index] ??= { current: initial };
    return state.refs[index];
  },
  useEffect: (effect: () => void) => state.effects.push(effect),
}));
vi.mock("@pte/ui", () => ({ useToast: () => ({ showToast: state.showToast }) }));
vi.mock("@pte/api-client", () => ({ getUserFacingApiErrorMessage: state.mapError }));

import { useChatUsageErrorToast } from "../../../../../features/chatUsage/hooks/useChatUsageErrorToast";

const RenderHook = (error: unknown, updatedAt: number, fallback = "Report unavailable"): void => {
  state.cursor = 0;
  state.effects = [];
  useChatUsageErrorToast(error, updatedAt, fallback);
  state.effects.forEach((effect) => effect());
};

beforeEach(() => {
  state.refs = [];
  vi.clearAllMocks();
});

describe("chat usage error toasts", () => {
  it("announces a failed query once across rerenders, locale changes and effect replay", () => {
    const error = new Error("request failed");
    RenderHook(error, 100);
    state.effects.forEach((effect) => effect());
    RenderHook(error, 100);
    RenderHook(error, 100, "Translated fallback");
    expect(state.showToast).toHaveBeenCalledExactlyOnceWith("Report unavailable", { tone: "error" });
    expect(state.mapError).toHaveBeenCalledExactlyOnceWith(error, "Report unavailable");
  });

  it("allows a new failure after recovery, even when the error object is reused", () => {
    const error = new Error("request failed");
    RenderHook(null, 0);
    expect(state.showToast).not.toHaveBeenCalled();
    RenderHook(error, 100);
    RenderHook(null, 100);
    RenderHook(error, 200);
    expect(state.showToast).toHaveBeenCalledTimes(2);
  });

  it("announces a later failed request without requiring an intervening recovery", () => {
    const error = new Error("request failed");
    RenderHook(error, 100);
    RenderHook(error, 200);
    RenderHook(error, 200);
    RenderHook(new Error("another request failed"), 300);
    expect(state.showToast).toHaveBeenCalledTimes(3);
  });
});
