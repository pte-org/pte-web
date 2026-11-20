import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { useLeaveAfterSave, type LeaveAfterSave } from "../../../src/hooks/useLeaveAfterSave";

const mount = (): LeaveAfterSave => {
  let hook!: LeaveAfterSave;
  renderToStaticMarkup(createElement(() => {
    hook = useLeaveAfterSave();
    return null;
  }));
  return hook;
};

describe("useLeaveAfterSave", () => {
  it("runs the save, then leaves once the save settles", () => {
    const hook = mount();
    const save = vi.fn();
    const proceed = vi.fn();
    hook.request(proceed, save);
    expect(save).toHaveBeenCalledOnce();
    expect(proceed).not.toHaveBeenCalled();
    hook.settle();
    expect(proceed).toHaveBeenCalledOnce();
  });

  it("leaves only once, and a plain save afterwards stays on the page", () => {
    const hook = mount();
    const proceed = vi.fn();
    hook.request(proceed, () => undefined);
    hook.settle();
    hook.settle();
    expect(proceed).toHaveBeenCalledOnce();
  });
});
