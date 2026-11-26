"use client";

import { useCallback } from "react";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { taskTypeLabel } from "../components/_rubricTaskTypeColumns";

/** A task type's display name from the question-type catalogue, or its code in Title Case when the catalogue has none. */
export function useTaskTypeName(): (code: string) => string {
  const { data: types = [] } = useQuestionTypes(false);
  return useCallback(
    (code) => types.find((type) => type.code?.toUpperCase() === code.toUpperCase())?.displayName ?? taskTypeLabel(code),
    [types],
  );
}
