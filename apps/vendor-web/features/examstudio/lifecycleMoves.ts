import type { MoveVerdict } from "./kanbanTransitions";

/**
 * What dropping a card on another column means for task types and exam templates. These follow the steps the
 * server allows, not every move a board could draw: a drop that has no step behind it is refused before it is
 * sent, and the server still decides who may take the step.
 */

/** Exam templates: submit a draft, return a submission, or approve and put it in use. */
export type TemplateMove = "submit" | "return" | "approve-activate" | "activate";

const TEMPLATE_STEPS: Record<string, Record<string, TemplateMove>> = {
  // A draft goes to review; going live without review is not a step of the board.
  DRAFT: { PENDING_APPROVAL: "submit" },
  // The reviewer sends a submission back with a reason, or approves it; approval and activation are
  // separate calls on the server, and the board does both when a reviewer drops it on "in use".
  PENDING_APPROVAL: { DRAFT: "return", ACTIVE: "approve-activate" },
  // An older version can be switched back on. Nothing retires an active template by hand: activating
  // another version does it.
  RETIRED: { ACTIVE: "activate" },
};

export const templateMove = (status: string, target: string): TemplateMove | null =>
  TEMPLATE_STEPS[status]?.[target] ?? null;

export function templateVerdict(status: string, target: string, canReview: boolean): MoveVerdict {
  const move = templateMove(status, target);
  if (move === null) return "not-a-step";
  return move !== "submit" && !canReview ? "needs-reviewer" : "allowed";
}

/** Task types: submit a draft, approve a submission (which activates it), retire one in use. */
export type TaskTypeMove = "submit" | "approve" | "retire";

const TASK_TYPE_STEPS: Record<string, Record<string, TaskTypeMove>> = {
  DRAFT: { PENDING_APPROVAL: "submit" },
  // The server has no way to return a task type submission, so "back to draft" is not a step.
  PENDING_APPROVAL: { ACTIVE: "approve" },
  ACTIVE: { RETIRED: "retire" },
};

export const taskTypeMove = (status: string, target: string): TaskTypeMove | null =>
  TASK_TYPE_STEPS[status]?.[target] ?? null;

export function taskTypeVerdict(status: string, target: string, canReview: boolean): MoveVerdict {
  const move = taskTypeMove(status, target);
  if (move === null) return "not-a-step";
  return move !== "submit" && !canReview ? "needs-reviewer" : "allowed";
}
