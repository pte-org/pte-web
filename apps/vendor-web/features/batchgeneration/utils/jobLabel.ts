import { taskTypeLabel } from "../../questiongeneration/utils/taskTypeLabel";

/** "Repeat Sentence · C1": the task type and, when known, the level it was generated at. */
export function jobLabel(taskType: string, cefrLevel: string | undefined): string {
  return cefrLevel ? `${taskTypeLabel(taskType)} · ${cefrLevel}` : taskTypeLabel(taskType);
}
