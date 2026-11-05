"use client";

import {
  getRubricTaskType,
  listRubricTaskTypes,
  listRubricVersions,
  type RubricVersionResponse,
  type TaskTypeRubricResponse,
} from "@pte/api-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { SCORING_RUBRIC_QUERY_KEYS } from "./constants";

/** Rubric read API only: this feature never reads attempt or score data. */
export function useRubricTaskTypes(
  versionId: string | null = null,
): UseQueryResult<TaskTypeRubricResponse[]> {
  return useQuery({
    queryKey: SCORING_RUBRIC_QUERY_KEYS.taskTypes(versionId),
    queryFn: () => listRubricTaskTypes(apiClient, versionId),
  });
}

/** `enabled` lets the detail page wait for the template list, so it does not load the ACTIVE rubric first. */
export function useRubricTaskType(
  taskType: string,
  versionId: string | null,
  enabled = true,
): UseQueryResult<TaskTypeRubricResponse> {
  return useQuery({
    queryKey: SCORING_RUBRIC_QUERY_KEYS.taskType(taskType, versionId),
    queryFn: () => getRubricTaskType(apiClient, taskType, versionId),
    enabled: enabled && taskType.length > 0,
  });
}

export function useRubricVersions(): UseQueryResult<RubricVersionResponse[]> {
  return useQuery({
    queryKey: SCORING_RUBRIC_QUERY_KEYS.versions(),
    queryFn: () => listRubricVersions(apiClient),
  });
}
