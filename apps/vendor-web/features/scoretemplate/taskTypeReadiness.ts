import type { QuestionTypeResponse } from "@pte/api-client";

/**
 * Legacy catalog responses have no runtime object and remain selectable during
 * the additive adapter window. Once runtime metadata is present, the editor
 * requires the complete active profile before offering the task to a new row.
 */
export function isTaskTypeRuntimeReady(taskType: QuestionTypeResponse): boolean {
  if (taskType.readiness?.ready === false) return false;

  const runtime = taskType.runtime;
  if (!runtime) return true;

  return (
    runtime.status === "ACTIVE" &&
    typeof runtime.screenKey === "string" &&
    runtime.screenKey.length > 0 &&
    typeof runtime.contractVersion === "number" &&
    runtime.contractVersion > 0 &&
    typeof runtime.profileKey === "string" &&
    runtime.profileKey.length > 0 &&
    typeof runtime.profileVersion === "number" &&
    typeof runtime.behaviorKey === "string" &&
    runtime.behaviorKey.length > 0 &&
    typeof runtime.rendererKey === "string" &&
    runtime.rendererKey.length > 0 &&
    typeof runtime.answerSchemaVersion === "number" &&
    typeof runtime.scoringProfileKey === "string" &&
    runtime.scoringProfileKey.length > 0 &&
    typeof runtime.scoringProfileVersion === "number" &&
    Array.isArray(runtime.requiredClientCapabilities)
  );
}

export function hasUnreadyTaskType(
  items: ReadonlyArray<{ taskTypeKey: string }>,
  taskTypes: ReadonlyArray<QuestionTypeResponse>,
): boolean {
  return items.some((item) => {
    const taskType = taskTypes.find(
      (candidate) => (candidate.taskTypeKey ?? candidate.code) === item.taskTypeKey,
    );
    return taskType !== undefined && !isTaskTypeRuntimeReady(taskType);
  });
}
