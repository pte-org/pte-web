import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  ref: { current: null as string | null },
  showToast: vi.fn(),
}));

vi.mock("react", () => ({
  useRef: () => state.ref,
  useEffect: (effect: () => void) => effect(),
}));
vi.mock("@pte/ui", () => ({ useToast: () => ({ showToast: state.showToast }) }));

import { useFeedbackToast } from "../../../../features/proctor/hooks/useFeedbackToast";

beforeEach(() => {
  state.ref.current = null;
  state.showToast.mockClear();
});

it("does not repeat a toast during a continuous polling failure", () => {
  useFeedbackToast("Refresh failed", "warning");
  useFeedbackToast("Refresh failed", "warning");
  expect(state.showToast).toHaveBeenCalledExactlyOnceWith("Refresh failed", { tone: "warning" });
});

it("reports a new failure after recovery and supports changed messages", () => {
  useFeedbackToast("Refresh failed");
  useFeedbackToast(null);
  useFeedbackToast("Refresh failed");
  useFeedbackToast("Save failed");
  expect(state.showToast).toHaveBeenCalledTimes(3);
  expect(state.showToast).toHaveBeenLastCalledWith("Save failed", { tone: "error" });
});

it("does not notify for an inactive or closed form", () => {
  useFeedbackToast(null);
  expect(state.showToast).not.toHaveBeenCalled();
});
