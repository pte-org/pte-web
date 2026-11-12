"use client";

import { useMemo, type ReactElement } from "react";
import { cn } from "@pte/ui";
import { diffLines, hasChanges, sideBySide, type DiffLine } from "../promptDiff";
import { fill, type PromptEditCopy } from "../promptEditConstants";

interface PromptDiffViewProps {
  before: string;
  after: string;
  copy: PromptEditCopy;
}

const LINE_TONE: Record<DiffLine["kind"], string> = {
  same: "",
  add: "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
  del: "bg-red-500/10 text-red-900 dark:text-red-200",
};
const MARK: Record<DiffLine["kind"], string> = { same: " ", add: "+", del: "-" };
const ROW_CLASS = "flex min-w-0 gap-2 px-3 py-0.5 text-sm leading-6";

const Cell = ({ line }: { line: DiffLine | null }): ReactElement => (
  <div className={cn(ROW_CLASS, line ? LINE_TONE[line.kind] : "bg-[var(--surface-subtle)]")}>
    <span className="w-4 shrink-0 select-none opacity-60">{line ? MARK[line.kind] : ""}</span>
    <span className="min-w-0 whitespace-pre-wrap break-words">{line?.text}</span>
  </div>
);

/**
 * What changed between two versions of a prompt, side by side: the older version on the left, the newer on the right,
 * with a line between them so each side is easy to follow.
 */
export const PromptDiffView = ({ before, after, copy }: PromptDiffViewProps): ReactElement => {
  const lines = useMemo(() => diffLines(before, after), [before, after]);
  const rows = useMemo(() => sideBySide(lines), [lines]);
  if (!hasChanges(lines)) return <p className="text-sm text-[var(--ink-secondary)]">{copy.DIFF_NONE}</p>;

  const added = lines.filter((line) => line.kind === "add").length;
  const removed = lines.filter((line) => line.kind === "del").length;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-emerald-700 dark:text-emerald-300">+ {fill(copy.DIFF_ADDED, { n: added })}</span>
        <span className="font-medium text-red-700 dark:text-red-300">− {fill(copy.DIFF_REMOVED, { n: removed })}</span>
      </div>
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[var(--shell-border)]">
        {rows.map((row, index) => (
          <div key={index} className="contents">
            <div className="min-w-0 border-r border-[var(--shell-border)]"><Cell line={row.left} /></div>
            <Cell line={row.right} />
          </div>
        ))}
      </div>
    </div>
  );
};
