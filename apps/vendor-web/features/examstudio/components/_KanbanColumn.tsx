"use client";

import { useRouter } from "next/navigation";
import { useState, type DragEvent, type ReactElement } from "react";
import { Alert, Button, Chip, EyeIcon, LockIcon, LoadingState, cn } from "@pte/ui";
import { useQuestions } from "@/features/questionbank/api";
import type { Question } from "@/features/questionbank/types";
import { cefrTone, sectionTone } from "@/lib/chipTones";
import { KANBAN_COLUMN_PAGE_SIZE, KANBAN_COLUMN_MAX_SIZE, QUESTION_ROUTE } from "../constants";
import { STATUS_OF_COLUMN, type KanbanColumn, type MoveVerdict } from "../kanbanTransitions";
import { useAuthorNames } from "../hooks/useAuthorNames";
import { useStudioLocation } from "../hooks/useStudioLocation";
import { BoardCard } from "./_BoardCard";
import {
  BOARD_COLUMN_FRAME,
  BOARD_COUNT_CLASS,
  BOARD_HEADER_CLASS,
  BOARD_TONE,
  type BoardTone,
} from "./boardTone";
import { SERVER_STATUS } from "./questionStatus";

const COLUMN_TONE: Record<KanbanColumn, BoardTone> = {
  draft: "neutral",
  pending: "warning",
  approved: "success",
  archived: "info",
};

interface KanbanColumnViewProps {
  column: KanbanColumn;
  title: string;
  /** What narrows the cards; the server does the filtering, so a column holds only what matches. */
  taskType: string;
  section: string;
  cefrLevel: string;
  query: string;
  emptyLabel: string;
  loadError: string;
  /** The label of the "open" entry in a card's menu. */
  viewLabel: string;
  /** The hint on a card's drag grip. */
  dragLabel: string;
  /** "Show N more" for the button that loads further cards. */
  moreLabel: (remaining: number) => string;
  /** Shown when the column holds as many cards as the board will load; the filters narrow it down. */
  limitLabel: string;
  draggingId: string | null;
  /** What dropping the dragged card here would do; null while nothing is dragged or for its own column. */
  verdict: MoveVerdict | null;
  /** Shown while the dragged card cannot land here because of the user's role. */
  lockedLabel: string;
  /** "Updated 3 hours ago" for a card; empty when the question carries no time. */
  updatedLabel: (question: Question) => string;
  onDragStart: (question: Question) => void;
  onDragEnd: () => void;
  onDropOn: (column: KanbanColumn) => void;
}

/**
 * One column of the board. It asks the server for its own cards, a page at a time, so the board stays
 * quick whatever the size of the question bank; its count is the server's total, not what is on screen.
 */
export const KanbanColumnView = ({
  column,
  title,
  taskType,
  section,
  cefrLevel,
  query,
  emptyLabel,
  loadError,
  viewLabel,
  dragLabel,
  moreLabel,
  limitLabel,
  draggingId,
  verdict,
  lockedLabel,
  updatedLabel,
  onDragStart,
  onDragEnd,
  onDropOn,
}: KanbanColumnViewProps): ReactElement => {
  const router = useRouter();
  const authorName = useAuthorNames();
  const { here } = useStudioLocation();
  const [isOver, setIsOver] = useState(false);
  const [size, setSize] = useState(KANBAN_COLUMN_PAGE_SIZE);
  const result = useQuestions(
    {
      status: SERVER_STATUS[STATUS_OF_COLUMN[column]],
      taskType: taskType || undefined,
      section: section || undefined,
      cefrLevel: cefrLevel || undefined,
      q: query || undefined,
    },
    0,
    size,
  );
  const cards = result.data?.data ?? [];
  const total = result.data?.meta.totalElements ?? 0;
  const tone = BOARD_TONE[COLUMN_TONE[column]];
  // A column that cannot take the dragged card does not accept a drop, so the browser shows
  // the "not allowed" cursor straight away instead of the user finding out after letting go.
  const accepts = verdict === null || verdict === "allowed";

  const handleDrop = (event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    setIsOver(false);
    if (accepts) onDropOn(column);
  };

  return (
    <section
      aria-label={title}
      onDragOver={(event) => {
        if (!accepts) return;
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex min-h-64 flex-col gap-3 outline-2 outline-dashed outline-transparent transition",
        BOARD_COLUMN_FRAME,
        tone.column,
        verdict === "allowed" && "outline-[var(--brand)]/40",
        isOver && "bg-[var(--action-tint)] outline-[var(--brand)]",
        (verdict === "needs-reviewer" || verdict === "not-a-step") && "opacity-60",
      )}
    >
      <h3 className={BOARD_HEADER_CLASS}>
        <span className={cn("h-2 w-2 rounded-full", tone.dot)} aria-hidden="true" />
        {title}
        <span className={BOARD_COUNT_CLASS}>({total})</span>
      </h3>
      {verdict === "needs-reviewer" && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
          <LockIcon className="h-3.5 w-3.5 shrink-0" />
          {lockedLabel}
        </p>
      )}
      {result.isError && <Alert tone="error">{loadError}</Alert>}
      {result.isLoading && <LoadingState />}
      {!result.isLoading && !result.isError && cards.length === 0 && (
        <p className="text-xs text-[var(--ink-muted)]">{emptyLabel}</p>
      )}
      <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto pr-0.5">
        {cards.map((question) => (
          <BoardCard
            key={question.id}
            draggable
            grip
            gripLabel={dragLabel}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", question.id);
              onDragStart(question);
            }}
            onDragEnd={onDragEnd}
            onClick={() =>
              router.push(`${QUESTION_ROUTE}/${question.id}?from=${encodeURIComponent(here)}`)
            }
            className={cn(
              "cursor-grab active:cursor-grabbing",
              draggingId === question.id && "opacity-40",
            )}
            tags={
              <>
                <Chip tone={sectionTone(question.skill)} size="sm">
                  {question.taskType}
                </Chip>
                {question.cefrLevel && (
                  <Chip tone={cefrTone(question.cefrLevel)} size="sm">
                    {question.cefrLevel}
                  </Chip>
                )}
              </>
            }
            title={question.content}
            menu={[
              {
                label: viewLabel,
                icon: EyeIcon,
                onSelect: () =>
                  router.push(`${QUESTION_ROUTE}/${question.id}?from=${encodeURIComponent(here)}`),
              },
            ]}
            authorName={authorName(question.authorId)}
            meta={question.updatedAt ? updatedLabel(question) : undefined}
          />
        ))}
        {total > cards.length && size < KANBAN_COLUMN_MAX_SIZE && (
          <Button
            size="sm"
            variant="secondary"
            appearance="outline"
            onClick={() =>
              setSize((current) =>
                Math.min(current + KANBAN_COLUMN_PAGE_SIZE, KANBAN_COLUMN_MAX_SIZE),
              )
            }
          >
            {moreLabel(total - cards.length)}
          </Button>
        )}
        {total > cards.length && size >= KANBAN_COLUMN_MAX_SIZE && (
          <p className="text-xs text-[var(--ink-muted)]">{limitLabel}</p>
        )}
      </div>
    </section>
  );
};
