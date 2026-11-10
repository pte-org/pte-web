"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { Select, useLocale } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useAdminSearchText } from "@/features/i18n/adminSearchCopy";
import type { Question } from "@/features/questionbank/types";
import { EXAM_STUDIO_TEXT, KANBAN_COLUMN_MAX_SIZE } from "../constants";
import { useKanbanMoves } from "../hooks/useKanbanMoves";
import { useStudioLocation } from "../hooks/useStudioLocation";
import { useUrlSearch } from "../hooks/useUrlSearch";
import { columnOf, KANBAN_COLUMNS, moveVerdict, type KanbanColumn } from "../kanbanTransitions";
import { formatRelativeTime } from "../relativeTime";
import type { StudioTile } from "../types";
import { BoardToolbar } from "./_BoardToolbar";
import { CefrFilter, SectionFilter } from "./_BoardFilters";
import { KanbanColumnView } from "./_KanbanColumn";

interface KanbanTabProps {
  tiles: StudioTile[];
  templatePublicId: string;
  /** What starts the toolbar row, such as the choice of board. */
  leading?: ReactNode;
}

export const KanbanTab = ({ tiles, templatePublicId, leading }: KanbanTabProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const searchText = useAdminSearchText("questionContent");
  const viewLabel = useAdminCopy("View");
  const { read, patch } = useStudioLocation();
  const taskType = read("kt") ?? "";
  const section = read("ks") ?? "";
  const cefrLevel = read("kc") ?? "";
  const { input: search, setInput: setSearch, settled: query } = useUrlSearch("kq");
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
      <BoardToolbar
        searchLabel={searchText.ariaLabel}
        placeholder={searchText.placeholder}
        search={search}
        onSearch={setSearch}
        end={leading}
      >
        <SectionFilter
          value={section}
          // A task type of another section no longer applies once the section changes.
          onChange={(value) => patch({ ks: value || null, kt: null })}
        />
        <Select
          aria-label={text.KANBAN_ALL_TYPES}
          value={taskType}
          onChange={(event) => patch({ kt: event.target.value || null })}
          size="md"
          variant="table"
          className="min-w-[190px]"
          options={[
            { value: "", label: text.KANBAN_ALL_TYPES },
            ...tiles
              .filter((tile) => section === "" || tile.type.section === section)
              .map((tile) => ({ value: tile.key, label: tile.type.displayName })),
          ]}
        />
        <CefrFilter value={cefrLevel} onChange={(value) => patch({ kc: value || null })} />
      </BoardToolbar>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumnView
            key={column}
            column={column}
            title={titles[column]}
            taskType={taskType}
            section={section}
            cefrLevel={cefrLevel}
            query={query}
            emptyLabel={text.EMPTY_COLUMN}
            loadError={text.KANBAN_LOAD_ERROR}
            viewLabel={viewLabel}
            dragLabel={text.KANBAN_DRAG}
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
