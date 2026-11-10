"use client";

import type { ReactElement, ReactNode } from "react";
import { EmptyState, ErrorState, LoadingState } from "@pte/ui";
import { useRubricTaskTypes } from "../api";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { RubricTaskTypeTable } from "./_RubricTaskTypeTable";

interface RubricTaskTypeListViewProps {
  /** Shown under the skill tabs; the page supplies it so this feature does not depend on others. */
  sidePanel?: ReactNode;
  /** Which version to list; the active one when omitted. */
  versionId?: string;
  toolbar?: ReactNode;
  toolbarActions?: ReactNode;
}

/** The standard task types of the ACTIVE rubric version, grouped by the skills they count toward. */
export const RubricTaskTypeListView = ({ sidePanel, versionId, toolbar, toolbarActions }: RubricTaskTypeListViewProps): ReactElement => {
  const { messages: M } = useScoringRubricText();
  const { data, isLoading, isError } = useRubricTaskTypes(versionId ?? null);

  if (isLoading) return <LoadingState rows={6} />;
  if (isError) return <ErrorState title={M.loadError} />;
  const taskTypes = data ?? [];
  if (taskTypes.length === 0) return <EmptyState title={M.empty} />;

  return <RubricTaskTypeTable taskTypes={taskTypes} sidePanel={sidePanel} versionId={versionId} toolbar={toolbar} toolbarActions={toolbarActions} />;
};
