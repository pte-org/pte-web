"use client";

import { useState, type ReactElement } from "react";
import { Alert, Input, LoadingState, Select, useLocale } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useQuestions } from "@/features/questionbank/api";
import { EXAM_STUDIO_TEXT, STUDIO_KANBAN_PAGE_SIZE } from "../constants";
import { useKanbanMoves } from "../hooks/useKanbanMoves";
import {
  columnOf,
  filterBoard,
  KANBAN_COLUMNS,
  moveVerdict,
  type KanbanColumn,
} from "../kanbanTransitions";
import { formatRelativeTime } from "../relativeTime";
import type { StudioTile } from "../types";
import { KanbanColumnView } from "./_KanbanColumn";

interface KanbanTabProps {
  tiles: StudioTile[];
  templatePublicId: string;
}

export const KanbanTab = ({ tiles, templatePublicId }: KanbanTabProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const [taskType, setTaskType] = useState("");
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const questions = useQuestions({}, 0, STUDIO_KANBAN_PAGE_SIZE);
  const { move, isMoving } = useKanbanMoves(templatePublicId);
  const { locale } = useLocale();
  const { data: currentUser } = useCurrentUser();
  const canReview = canReviewAcademic(currentUser?.roles);

  const titles: Record<KanbanColumn, string> = {
    draft: text.STATUS_DRAFT,
    pending: text.STATUS_PENDING,
    approved: text.STATUS_PUBLISHED,
    archived: text.STATUS_ARCHIVED,
  };

  if (questions.isLoading) return <LoadingState />;
  if (questions.isError) return <Alert tone="error">{text.KANBAN_LOAD_ERROR}</Alert>;

  const visible = filterBoard(questions.data?.data ?? [], taskType, search);
  const dragged = visible.find((question) => question.id === draggingId) ?? null;
  const dropOn = (column: KanbanColumn): void => {
    setDraggingId(null);
    if (dragged && !isMoving && columnOf(dragged) !== column) move(dragged, column);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-secondary)]">{text.KANBAN_HINT}</p>
      <div className="flex flex-wrap items-end gap-3">
        <Select
          id="studio-kanban-task-type"
          label={text.KANBAN_ALL_TYPES}
          value={taskType}
          onChange={(event) => setTaskType(event.target.value)}
          options={[
            { value: "", label: text.KANBAN_ALL_TYPES },
            ...tiles.map((tile) => ({ value: tile.key, label: tile.type.displayName })),
          ]}
        />
        <Input
          id="studio-kanban-search"
          label={text.KANBAN_SEARCH}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumnView
            key={column}
            column={column}
            title={titles[column]}
            emptyLabel={text.EMPTY_COLUMN}
            questions={visible.filter((question) => columnOf(question) === column)}
            draggingId={draggingId}
            verdict={
              dragged && columnOf(dragged) !== column
                ? moveVerdict(dragged, column, canReview)
                : null
            }
            lockedLabel={text.LOCKED_NEEDS_REVIEWER}
            updatedLabel={(question) =>
              text.UPDATED.replace(
                "{time}",
                formatRelativeTime(question.updatedAt ?? "", new Date(), locale),
              )
            }
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            onDropOn={dropOn}
          />
        ))}
      </div>
    </div>
  );
};
