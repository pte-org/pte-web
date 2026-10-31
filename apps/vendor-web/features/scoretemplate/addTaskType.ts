import type { QuestionTypeResponse } from "@pte/api-client";
import { isTaskTypeRuntimeReady } from "./taskTypeReadiness";
import type { ScoreTemplateItemDraft } from "./types";

/** Why nothing can be added to a section right now; each maps to a `SCORE_TEMPLATE_TEXT` message. */
export type AddTaskTypeBlocker =
  | "NO_ACTIVE_TASK_TYPES"
  | "ALL_ACTIVE_TYPES_USED"
  | "INCOMPATIBLE_RUNTIME_PROFILE";

export const taskTypeKeyOf = (type: QuestionTypeResponse): string => type.taskTypeKey ?? type.code;

const usedKeys = (items: ScoreTemplateItemDraft[]): Set<string> =>
  new Set(items.map((item) => item.taskTypeKey));

/** Active, runtime-ready task types of `section` that the template does not use yet. */
export function findAvailableTaskTypes(
  questionTypes: QuestionTypeResponse[],
  items: ScoreTemplateItemDraft[],
  section: string,
): QuestionTypeResponse[] {
  const used = usedKeys(items);
  return questionTypes.filter(
    (type) =>
      type.active &&
      isTaskTypeRuntimeReady(type) &&
      type.section === section &&
      !used.has(taskTypeKeyOf(type)),
  );
}

/** `null` when something can be added (or no section is chosen yet). */
export function getAddTaskTypeBlocker(
  questionTypes: QuestionTypeResponse[],
  items: ScoreTemplateItemDraft[],
  section: string,
): AddTaskTypeBlocker | null {
  if (!section) return null;
  const activeInSection = questionTypes.filter((type) => type.active && type.section === section);
  if (activeInSection.length === 0) return "NO_ACTIVE_TASK_TYPES";
  if (findAvailableTaskTypes(questionTypes, items, section).length > 0) return null;
  const used = usedKeys(items);
  return activeInSection.every((type) => used.has(taskTypeKeyOf(type)))
    ? "ALL_ACTIVE_TYPES_USED"
    : "INCOMPATIBLE_RUNTIME_PROFILE";
}

/**
 * A fresh row for `type`. scoringMethod is deliberately not set: it is derived by the
 * backend from the task type and never accepted as admin input.
 */
export function createDraftItem(type: QuestionTypeResponse, sequence: number): ScoreTemplateItemDraft {
  return {
    taskType: type.code,
    taskTypeKey: taskTypeKeyOf(type),
    section: type.section,
    sequence,
    minCount: "1",
    maxCount: "1",
    prepSeconds: "0",
    responseSeconds: "0",
    overallWeight: "0",
    speakingWeight: "0",
    writingWeight: "0",
    readingWeight: "0",
    listeningWeight: "0",
  };
}
