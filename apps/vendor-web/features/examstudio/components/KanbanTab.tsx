"use client";

import { useState, type ReactElement } from "react";
import { Input, Select, useLocale } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import type { Question } from "@/features/questionbank/types";
import { EXAM_STUDIO_TEXT, KANBAN_COLUMN_MAX_SIZE } from "../constants";
import { useKanbanMoves } from "../hooks/useKanbanMoves";
import { useSettled } from "../hooks/useSettled";
import { columnOf, KANBAN_COLUMNS, moveVerdict, type KanbanColumn } from "../kanbanTransitions";
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
  const query = useSettled(search.trim());
  // The card being dragged is kept whole: it may come from a column the others do not load.
  const [dragged, setDragged] = useState<Question | null>(null);
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
  const dropOn = (column: KanbanColumn): void => {
    const card = dragged;
    setDragged(null);
    if (card && !isMoving && columnOf(card) !== column) move(card, column);
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
            taskType={taskType}
            query={query}
            emptyLabel={text.EMPTY_COLUMN}
            loadError={text.KANBAN_LOAD_ERROR}
            moreLabel={(remaining) => text.KANBAN_MORE.replace("{count}", String(remaining))}
            limitLabel={text.KANBAN_LIMIT.replace("200", String(KANBAN_COLUMN_MAX_SIZE))}
            draggingId={dragged?.id ?? null}
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
            onDragStart={setDragged}
            onDragEnd={() => setDragged(null)}
            onDropOn={dropOn}
          />
        ))}
      </div>
    </div>
  );
};
