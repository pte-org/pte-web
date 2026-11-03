"use client";

import { useRouter } from "next/navigation";
import { useState, type DragEvent, type ReactElement } from "react";
import { Alert, Button, Chip, LockIcon, LoadingState, cn } from "@pte/ui";
import { useQuestions } from "@/features/questionbank/api";
import type { Question } from "@/features/questionbank/types";
import { cefrTone, sectionTone } from "@/lib/chipTones";
import {
  EXAM_STUDIO_ROUTE,
  KANBAN_COLUMN_PAGE_SIZE,
  KANBAN_COLUMN_MAX_SIZE,
  QUESTION_ROUTE,
} from "../constants";
import { STATUS_OF_COLUMN, type KanbanColumn, type MoveVerdict } from "../kanbanTransitions";
import { SERVER_STATUS } from "./questionStatus";

/** What marks each column: the colour of its top edge, its count and its tint while a card hovers over it. */
const COLUMN_TONE: Record<KanbanColumn, { edge: string; count: string }> = {
  draft: {
    edge: "border-t-[var(--ink-muted)]",
    count: "bg-[var(--surface-card)] text-[var(--ink-secondary)]",
  },
  pending: {
    edge: "border-t-[var(--cream-action)]",
    count: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
  },
  approved: {
    edge: "border-t-[var(--mint-action)]",
    count: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
  },
  archived: {
    edge: "border-t-[var(--sky-action)]",
    count: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
  },
};

interface KanbanColumnViewProps {
  column: KanbanColumn;
  title: string;
  /** What narrows the cards; the server does the filtering, so a column holds only what matches. */
  taskType: string;
  query: string;
  emptyLabel: string;
  loadError: string;
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
  query,
  emptyLabel,
  loadError,
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
  const [isOver, setIsOver] = useState(false);
  const [size, setSize] = useState(KANBAN_COLUMN_PAGE_SIZE);
  const result = useQuestions(
    {
      status: SERVER_STATUS[STATUS_OF_COLUMN[column]],
      taskType: taskType || undefined,
      q: query || undefined,
    },
    0,
    size,
  );
  const cards = result.data?.data ?? [];
  const total = result.data?.meta.totalElements ?? 0;
  const tone = COLUMN_TONE[column];
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
        "flex min-h-64 flex-col gap-2 rounded-xl border-t-4 bg-[var(--surface-subtle)] p-3 outline-2 outline-dashed outline-transparent transition",
        tone.edge,
        verdict === "allowed" && "outline-[var(--brand)]/40",
        isOver && "bg-[var(--action-tint)] outline-[var(--brand)]",
        (verdict === "needs-reviewer" || verdict === "not-a-step") && "opacity-60",
      )}
    >
      <h3 className="flex items-center justify-between text-sm font-semibold text-[var(--ink-primary)]">
        {title}
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tone.count)}>
          {total}
        </span>
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
      <div className="flex max-h-[65vh] flex-col gap-2 overflow-y-auto pr-0.5">
        {cards.map((question) => (
          <article
            key={question.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", question.id);
              onDragStart(question);
            }}
            onDragEnd={onDragEnd}
            onClick={() =>
              router.push(`${QUESTION_ROUTE}/${question.id}?from=${EXAM_STUDIO_ROUTE}`)
            }
            className={cn(
              "cursor-grab space-y-1.5 rounded-lg border border-[var(--shell-border)] border-l-4 bg-[var(--surface-card)] p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing",
              SKILL_EDGE[question.skill],
              draggingId === question.id && "opacity-40",
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip tone={sectionTone(question.skill)} size="sm">
                {question.taskType}
              </Chip>
              {question.cefrLevel && (
                <Chip tone={cefrTone(question.cefrLevel)} size="sm">
                  {question.cefrLevel}
                </Chip>
              )}
            </div>
            <p className="line-clamp-3 text-sm text-[var(--ink-primary)]">{question.content}</p>
            {question.updatedAt && (
              <p className="text-[11px] text-[var(--ink-muted)]">{updatedLabel(question)}</p>
            )}
          </article>
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

/** The left edge of a card takes the colour of its skill, so the mix of a column reads at a glance. */
const SKILL_EDGE: Record<Question["skill"], string> = {
  speaking: "border-l-violet-500",
  writing: "border-l-cyan-500",
  reading: "border-l-green-500",
  listening: "border-l-orange-500",
};
