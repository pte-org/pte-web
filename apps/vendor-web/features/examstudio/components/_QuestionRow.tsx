"use client";

import type { ReactElement, ReactNode } from "react";
import { Badge, Chip } from "@pte/ui";
import type { Question } from "@/features/questionbank/types";
import { cefrTone } from "@/lib/chipTones";
import { STATUS_BADGE } from "./questionStatus";

interface QuestionRowProps {
  question: Question;
  statusLabel: string;
  /** Shown for a draft that can be picked for the bulk delete. */
  selection?: { checked: boolean; label: string; disabled: boolean; onToggle: () => void };
  onOpen: () => void;
  /** The workflow buttons of the row (submit, approve). */
  actions?: ReactNode;
}

/** One question of the list: a pick box when it is a deletable draft, its text, level, status and actions. */
export const QuestionRow = ({ question, statusLabel, selection, onOpen, actions }: QuestionRowProps): ReactElement => (
  <li className="flex items-center gap-2 px-1 py-1">
    {selection ? (
      <input type="checkbox" className="ml-2 h-4 w-4 shrink-0 accent-[var(--brand)]" aria-label={selection.label}
        checked={selection.checked} disabled={selection.disabled} onChange={selection.onToggle} />
    ) : null}
    <button
      type="button"
      onClick={onOpen}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-[var(--action-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
      title={question.content}
    >
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--ink-primary)]">{question.content}</span>
      {question.cefrLevel && (
        <Chip tone={cefrTone(question.cefrLevel)} size="sm">{question.cefrLevel}</Chip>
      )}
      <Badge variant={STATUS_BADGE[question.status]}>{statusLabel}</Badge>
    </button>
    {actions}
  </li>
);
