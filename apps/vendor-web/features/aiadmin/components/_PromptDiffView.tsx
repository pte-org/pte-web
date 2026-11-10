"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Button, cn } from "@pte/ui";
import { diffLines, hasChanges, sideBySide, withContext, type DiffLine } from "../promptDiff";
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

const Fold = ({ count, copy }: { count: number; copy: PromptEditCopy }): ReactElement => (
  <div className="bg-[var(--surface-subtle)] px-3 py-1 text-center text-xs text-[var(--ink-secondary)]">
    {fill(copy.DIFF_FOLDED, { n: count })}
  </div>
);

/** What changed between two versions of a prompt, drawn like the changes of a code review: added and removed lines. */
export const PromptDiffView = ({ before, after, copy }: PromptDiffViewProps): ReactElement => {
  const [sideMode, setSideMode] = useState(false);
  const lines = useMemo(() => diffLines(before, after), [before, after]);
  const items = useMemo(() => withContext(lines), [lines]);
  const rows = useMemo(() => sideBySide(lines), [lines]);
  if (!hasChanges(lines)) return <p className="text-sm text-[var(--ink-secondary)]">{copy.DIFF_NONE}</p>;

  const added = lines.filter((line) => line.kind === "add").length;
  const removed = lines.filter((line) => line.kind === "del").length;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-emerald-700 dark:text-emerald-300">+ {fill(copy.DIFF_ADDED, { n: added })}</span>
        <span className="font-medium text-red-700 dark:text-red-300">− {fill(copy.DIFF_REMOVED, { n: removed })}</span>
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant={sideMode ? "ghost" : "secondary"} onClick={() => setSideMode(false)}>{copy.DIFF_ONE_COLUMN}</Button>
          <Button size="sm" variant={sideMode ? "secondary" : "ghost"} onClick={() => setSideMode(true)}>{copy.DIFF_SIDE_BY_SIDE}</Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-[var(--shell-border)]">
        {sideMode ? (
          <div className="grid grid-cols-2 divide-x divide-[var(--shell-border)]">
            {rows.map((row, index) => (
              <div key={index} className="contents">
                <Cell line={row.left} />
                <Cell line={row.right} />
              </div>
            ))}
          </div>
        ) : (
          items.map((item, index) =>
            item.type === "fold" ? <Fold key={index} count={item.count} copy={copy} /> : <Cell key={index} line={item.line} />,
          )
        )}
      </div>
    </div>
  );
};
