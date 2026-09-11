"use client";

import { useState, type ReactElement } from "react";
import { PageHeader } from "@pte/ui";
import { QUESTIONBANK_TEXT } from "../constants";
import { filterQuestions } from "../filterQuestions";
import { useQuestionStats, useQuestions } from "../api";
import type { QuestionFilter } from "../types";
import { QuestionStatGrid } from "./_QuestionStatGrid";
import { QuestionFilters } from "./_QuestionFilters";
import { QuestionTable } from "./_QuestionTable";

const INITIAL_FILTER: QuestionFilter = {
  query: "",
  skill: "all",
  difficulty: "all",
  status: "all",
};

export const QuestionBankView = (): ReactElement => {
  const { data: stats } = useQuestionStats();
  const { data: questions } = useQuestions();
  const [filter, setFilter] = useState<QuestionFilter>(INITIAL_FILTER);

  const visibleQuestions = filterQuestions(questions ?? [], filter);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={QUESTIONBANK_TEXT.TITLE}
        subtitle={QUESTIONBANK_TEXT.SUBTITLE}
        actions={
          <button
            type="button"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            + {QUESTIONBANK_TEXT.ADD}
          </button>
        }
      />
      <QuestionStatGrid stats={stats} />
      <QuestionFilters filter={filter} onChange={setFilter} />
      <QuestionTable questions={visibleQuestions} />
    </div>
  );
};
