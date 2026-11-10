import { Children, isValidElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ExaminerMarkingToolbar } from "@/features/examiner/components/ExaminerMarkingToolbar";
import { EXAMINER_WORK_TEXT } from "@/features/examiner/constants";
import type { ExaminerAttemptController } from "@/features/examiner/useExaminerAttemptController";

interface ActionProps { children?: ReactNode; onClick?: () => Promise<void>; disabled?: boolean }

function findAction(node: ReactNode, label: string): ActionProps | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<ActionProps>(child)) continue;
    if (child.props.children === label) return child.props;
    const found = findAction(child.props.children, label);
    if (found) return found;
  }
  return undefined;
}

function setup(saved: boolean) {
  const onSelect = vi.fn();
  const onSave = vi.fn().mockResolvedValue(saved);
  // This pure presentation component only reads these controller fields.
  const state = {
    T: EXAMINER_WORK_TEXT, currentIndex: 0, answers: [{}, {}], handleSelectIndex: onSelect,
    workflow: { canStart: false, canFinalize: false }, hasUnsaved: true, isSavingDraft: false,
    isFinalizing: false, hasOpenIssue: false, currentAnswer: { myScore: null, decision: null, canFinalize: true },
    activeDraft: { score: "65", isDirty: true }, isStale: false, promptMedia: "ready", responseMedia: "ready",
    handleSaveClick: onSave,
  } as unknown as ExaminerAttemptController;
  return { state, onSelect, onSave };
}

describe("examiner marking toolbar", () => {
  it("advances only after a successful save", async () => {
    const { state, onSelect, onSave } = setup(true);
    const action = findAction(ExaminerMarkingToolbar({ state }), EXAMINER_WORK_TEXT.SAVE_AND_NEXT);
    expect(action?.disabled).toBe(false);
    await action?.onClick?.();
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("keeps the current question after a failed save", async () => {
    const { state, onSelect } = setup(false);
    await findAction(ExaminerMarkingToolbar({ state }), EXAMINER_WORK_TEXT.SAVE_AND_NEXT)?.onClick?.();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("blocks save-and-next when media is unavailable", () => {
    const { state } = setup(true);
    state.responseMedia = "failed";
    expect(findAction(ExaminerMarkingToolbar({ state }), EXAMINER_WORK_TEXT.SAVE_AND_NEXT)?.disabled).toBe(true);
  });
});
