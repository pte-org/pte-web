"use client";

import { useState, type DragEvent, type ReactElement } from "react";
import { Badge, LockIcon, cn } from "@pte/ui";
import type { Question } from "@/features/questionbank/types";
import type { KanbanColumn, MoveVerdict } from "../kanbanTransitions";

interface KanbanColumnViewProps {
  column: KanbanColumn;
  title: string;
  emptyLabel: string;
  questions: Question[];
  draggingId: string | null;
  /** What dropping the dragged card here would do; null while nothing is dragged or for its own column. */
  verdict: MoveVerdict | null;
  /** Shown while the dragged card cannot land here because of the user's role. */
  lockedLabel: string;
  /** "Updated 3 hours ago" for a card; empty when the question carries no time. */
  updatedLabel: (question: Question) => string;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDropOn: (column: KanbanColumn) => void;
}

export const KanbanColumnView = ({
  column,
  title,
  emptyLabel,
  questions,
  draggingId,
  verdict,
  lockedLabel,
  updatedLabel,
  onDragStart,
  onDragEnd,
  onDropOn,
}: KanbanColumnViewProps): ReactElement => {
  const [isOver, setIsOver] = useState(false);
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
        "flex min-h-64 flex-col gap-2 rounded-xl bg-[var(--surface-subtle)] p-3 outline-2 outline-dashed outline-transparent transition",
        verdict === "allowed" && "outline-[var(--brand)]/40",
        isOver && "bg-[var(--action-tint)] outline-[var(--brand)]",
        (verdict === "needs-reviewer" || verdict === "not-a-step") && "opacity-60",
      )}
    >
      <h3 className="flex items-center justify-between text-sm font-semibold text-[var(--ink-primary)]">
        {title}
        <Badge variant="neutral">{questions.length}</Badge>
      </h3>
      {verdict === "needs-reviewer" && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
          <LockIcon className="h-3.5 w-3.5 shrink-0" />
          {lockedLabel}
        </p>
      )}
      {questions.length === 0 && <p className="text-xs text-[var(--ink-muted)]">{emptyLabel}</p>}
      {questions.map((question) => (
        <article
          key={question.id}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", question.id);
            onDragStart(question.id);
          }}
          onDragEnd={onDragEnd}
          className={cn(
            "cursor-grab space-y-1 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-3 shadow-sm active:cursor-grabbing",
            draggingId === question.id && "opacity-40",
          )}
        >
          <p className="font-mono text-[11px] font-semibold text-[var(--ink-muted)]">
            {question.taskType}
          </p>
          <p className="line-clamp-3 text-sm text-[var(--ink-primary)]">{question.content}</p>
          {question.updatedAt && (
            <p className="text-[11px] text-[var(--ink-muted)]">{updatedLabel(question)}</p>
          )}
        </article>
      ))}
    </section>
  );
};
