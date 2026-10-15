"use client";

import type { ReactElement } from "react";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";
import { Button } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T } from "../constants";

interface QuestionNavigatorProps {
  answers: ExaminerAnswerDetailResponse[];
  currentIndex: number;
  drafts: Record<string, string>;
  onSelectIndex: (index: number) => void;
}

export const QuestionNavigator = ({
  answers,
  currentIndex,
  drafts,
  onSelectIndex,
}: QuestionNavigatorProps): ReactElement => {
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < answers.length - 1;

  return (
    <nav className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label={T.NAV_TITLE}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">{T.NAV_TITLE}</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={!canGoPrev}
            onClick={() => onSelectIndex(currentIndex - 1)}
          >
            {T.PREV_QUESTION}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!canGoNext}
            onClick={() => onSelectIndex(currentIndex + 1)}
          >
            {T.NEXT_QUESTION}
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-1">
        {answers.map((answer, index) => {
          const isSelected = index === currentIndex;
          const isSaved = answer.myScore !== null || answer.decision !== null;
          const hasDraft = !isSaved && Boolean(drafts[answer.answerPublicId]?.trim());

          return (
            <button
              key={answer.answerPublicId}
              type="button"
              onClick={() => onSelectIndex(index)}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                isSelected
                  ? "bg-blue-50 font-semibold text-blue-900 ring-1 ring-blue-600/30"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="truncate">
                <span>{index + 1}. </span>
                <span>{answer.taskType.replaceAll("_", " ")}</span>
              </div>
              <div className="ml-2 shrink-0">
                {isSaved ? (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title={T.STATUS_SAVED} />
                ) : hasDraft ? (
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" title={T.STATUS_DRAFT} />
                ) : (
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-300" title={T.NOT_STARTED_TITLE} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
