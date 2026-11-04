"use client";

import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT } from "../constants";
import { useStudioLocation } from "../hooks/useStudioLocation";
import type { StudioKind, StudioTile } from "../types";
import { KanbanTab } from "./KanbanTab";
import { TaskTypeBoard } from "./TaskTypeBoard";
import { TemplateBoard } from "./TemplateBoard";

interface BoardTabProps {
  tiles: StudioTile[];
  templatePublicId: string;
}

/**
 * The board of what waits for review, for one kind of content at a time, chosen from the list: the
 * questions, the task types or the exam templates. Each has its own board, so the three are never mixed.
 */
export const BoardTab = ({ tiles, templatePublicId }: BoardTabProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { kind, setKind } = useStudioLocation();

  const kindSelect = (
    <Select
      aria-label={text.KIND_LABEL}
      value={kind}
      onChange={(event) => setKind(event.target.value as StudioKind)}
      size="md"
      variant="table"
      className="min-w-[190px]"
      options={[
        { value: "questions", label: text.KIND_QUESTIONS },
        { value: "taskTypes", label: text.KIND_TASK_TYPES },
        { value: "templates", label: text.KIND_TEMPLATES },
      ]}
    />
  );

  if (kind === "taskTypes") return <TaskTypeBoard leading={kindSelect} />;
  if (kind === "templates") return <TemplateBoard leading={kindSelect} />;
  return <KanbanTab tiles={tiles} templatePublicId={templatePublicId} leading={kindSelect} />;
};
