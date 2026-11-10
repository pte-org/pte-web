"use client";

import type { ReactElement } from "react";
import { cn } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";

export type QuestionStatus = "saved" | "draft" | "carried" | "todo";

interface QuestionTileProps {
  number: number;
  taskType: string;
  status: QuestionStatus;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

const STATUS_DOT: Record<Exclude<QuestionStatus, "saved">, string> = {
  draft: "bg-amber-500",
  carried: "bg-violet-500",
  todo: "bg-slate-300",
};

/** One question in the navigator: its number, task type and marking status; a marked one shows a green tick. */
export const QuestionTile = ({ number, taskType, status, selected, disabled, onSelect }: QuestionTileProps): ReactElement => {
  const T = useExaminerWorkText();
  const statusLabel = { saved: T.STATUS_SAVED, draft: T.STATUS_DRAFT, carried: T.CARRIED_OVER_BADGE,
    todo: T.NOT_STARTED_TITLE }[status];
  return (
    <button type="button" disabled={disabled} aria-current={selected ? "step" : undefined} onClick={onSelect}
      title={statusLabel}
      className={cn("flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors",
        "disabled:cursor-wait disabled:opacity-60",
        selected ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/30" : "border-slate-200 hover:bg-slate-50",
        status === "saved" && !selected && "border-emerald-200 bg-emerald-50/60")}>
      <span className="w-6 shrink-0 text-sm font-semibold tabular-nums text-slate-800">{number}</span>
      <span className="min-w-0 flex-1 truncate text-slate-600">{taskType.replaceAll("_", " ")}</span>
      {status === "saved" ? (
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
          aria-label={statusLabel}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3" aria-hidden="true">
            <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", STATUS_DOT[status])} aria-label={statusLabel} />}
    </button>
  );
};
