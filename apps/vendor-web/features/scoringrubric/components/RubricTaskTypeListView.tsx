"use client";

import type { ReactElement } from "react";
import { EmptyState, ErrorState, LoadingState } from "@pte/ui";
import { useRubricTaskTypes } from "../api";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { RubricTaskTypeTable } from "./_RubricTaskTypeTable";

/** The standard task types of the ACTIVE rubric version, grouped by the skills they count toward. */
export const RubricTaskTypeListView = (): ReactElement => {
  const { messages: M } = useScoringRubricText();
  const { data, isLoading, isError } = useRubricTaskTypes();

  if (isLoading) return <LoadingState rows={6} />;
  if (isError) return <ErrorState title={M.loadError} />;
  const taskTypes = data ?? [];
  if (taskTypes.length === 0) return <EmptyState title={M.empty} />;

  return <RubricTaskTypeTable taskTypes={taskTypes} />;
};
