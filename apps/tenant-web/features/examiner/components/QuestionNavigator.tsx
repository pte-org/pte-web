"use client";

import { useState, type ReactElement } from "react";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";
import { Tabs } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";
import type { DraftEntry } from "../submissionTypes";
import { QuestionTile, type QuestionStatus } from "./QuestionTile";

interface QuestionNavigatorProps {
  disabled?: boolean;
  answers: ExaminerAnswerDetailResponse[];
  currentIndex: number;
  drafts: Record<string, DraftEntry>;
  carriedOverIds: ReadonlySet<string>;
  onSelectIndex: (index: number) => void;
}

const FILTERS = ["all", "todo", "done"] as const;
type Filter = (typeof FILTERS)[number];
const isFilter = (value: string): value is Filter => FILTERS.some((filter) => filter === value);

const statusOf = (answer: ExaminerAnswerDetailResponse, draft: DraftEntry | undefined,
  carriedOver: boolean): QuestionStatus => {
  if (carriedOver && answer.myScore === null) return "carried";
  if (answer.myScore !== null || answer.decision !== null) return "saved";
  if (draft?.score.trim() || draft?.savedAt) return "draft";
  return "todo";
};

/**
 * Every question of the attempt as compact numbered tiles grouped by skill, so even a full-length exam fits in one
 * popup; a filter narrows the grid to the questions still to mark.
 */
export const QuestionNavigator = ({
  answers, currentIndex, drafts, carriedOverIds, onSelectIndex, disabled = false,
}: QuestionNavigatorProps): ReactElement => {
  const T = useExaminerWorkText();
  const [filter, setFilter] = useState<Filter>("all");
  const entries = answers.map((answer, index) => ({ answer, index,
    status: statusOf(answer, drafts[answer.answerPublicId], carriedOverIds.has(answer.answerPublicId)) }));
  const doneCount = entries.filter((entry) => entry.status === "saved").length;
  const visible = entries.filter((entry) => filter === "all" || (filter === "done") === (entry.status === "saved"));
  const sections = [...new Set(visible.map((entry) => entry.answer.prompt.section))];

  return (
    <nav aria-label={T.NAV_TITLE} className="space-y-4">
      <Tabs id="examiner-question-filter" variant="minimal" value={filter} onChange={(value) => { if (isFilter(value)) setFilter(value); }}
        items={[{ id: "all", label: T.NAV_FILTER_ALL, count: entries.length },
          { id: "todo", label: T.NAV_FILTER_TODO, count: entries.length - doneCount },
          { id: "done", label: T.NAV_FILTER_DONE, count: doneCount }]} />
      {visible.length === 0 && <p className="text-sm text-slate-500">{T.NAV_EMPTY}</p>}
      {sections.map((section) => (
        <section key={section} aria-label={section}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{section}</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {visible.filter((entry) => entry.answer.prompt.section === section).map((entry) => (
              <QuestionTile key={entry.answer.answerPublicId} number={entry.index + 1}
                taskType={entry.answer.taskType} status={entry.status} selected={entry.index === currentIndex}
                disabled={disabled} onSelect={() => onSelectIndex(entry.index)} />
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
};
