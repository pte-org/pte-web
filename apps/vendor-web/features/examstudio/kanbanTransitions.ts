import type { Question, QuestionStatus } from "../questionbank/types";

export type KanbanColumn = "draft" | "pending" | "approved" | "archived";

export const KANBAN_COLUMNS: readonly KanbanColumn[] = ["draft", "pending", "approved", "archived"];

const COLUMN_OF: Record<QuestionStatus, KanbanColumn> = {
  draft: "draft",
  pending_approval: "pending",
  published: "approved",
  archived: "archived",
};

/** The question status each column holds. */
export const STATUS_OF_COLUMN: Record<KanbanColumn, QuestionStatus> = {
  draft: "draft",
  pending: "pending_approval",
  approved: "published",
  archived: "archived",
};

export const columnOf = (question: Question): KanbanColumn => COLUMN_OF[question.status];

/** What the API call for a move is; `null` where the lifecycle has no such step. */
export type KanbanAction = "submit" | "approve" | "archive";

const ACTION_BETWEEN: Partial<Record<KanbanColumn, Partial<Record<KanbanColumn, KanbanAction>>>> = {
  draft: { pending: "submit" },
  pending: { approved: "approve" },
  approved: { archived: "archive" },
};

export function actionFor(question: Question, target: KanbanColumn): KanbanAction | null {
  const action = ACTION_BETWEEN[columnOf(question)]?.[target] ?? null;
  // Only some approved questions may be archived (e.g. not while a template still depends on them).
  if (action === "archive" && question.canArchive === false) return null;
  return action;
}

export const needsReviewerRole = (action: KanbanAction): boolean => action === "approve";

/** Whether the signed-in user may drop a card on a column, and if not, why. */
export type MoveVerdict = "allowed" | "needs-reviewer" | "not-a-step";

export function moveVerdict(
  question: Question,
  target: KanbanColumn,
  canReview: boolean,
): MoveVerdict {
  const action = actionFor(question, target);
  if (action === null) return "not-a-step";
  return needsReviewerRole(action) && !canReview ? "needs-reviewer" : "allowed";
}
