"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import { Alert, PageHeader, PaginationControls } from "@pte/ui";
import { QUESTIONBANK_TEXT } from "../constants";
import { useQuestionStats, useQuestions } from "../api";
import type { QuestionFilter, QuestionSkillFilter, QuestionStatusFilter } from "../types";
import { QuestionStatGrid } from "./_QuestionStatGrid";
import { QuestionFilters } from "./_QuestionFilters";
import { QuestionTable } from "./_QuestionTable";

const INITIAL_FILTER: QuestionFilter = {
  query: "",
  skill: "all",
  status: "all",
};

const SECTION_BY_SKILL: Record<Exclude<QuestionSkillFilter, "all">, string> = {
  listening: "LISTENING",
  reading: "READING",
  writing: "WRITING",
  speaking: "SPEAKING",
};

const STATUS_BY_FILTER: Record<Exclude<QuestionStatusFilter, "all">, string> = {
  draft: "DRAFT",
  pending_approval: "PENDING_APPROVAL",
  published: "APPROVED",
  archived: "ARCHIVED",
};

export const QuestionBankView = (): ReactElement => {
  const router = useRouter();
  const { data: stats } = useQuestionStats();
  const [filter, setFilter] = useState<QuestionFilter>(INITIAL_FILTER);
  const [debouncedQuery, setDebouncedQuery] = useState(INITIAL_FILTER.query);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(filter.query), 250);
    return () => clearTimeout(timeout);
  }, [filter.query]);

  const { data: questionPage, isError, isFetching } = useQuestions(
    {
      q: debouncedQuery.trim() || undefined,
      section: filter.skill === "all" ? undefined : SECTION_BY_SKILL[filter.skill],
      status: filter.status === "all" ? undefined : STATUS_BY_FILTER[filter.status],
    },
    page,
    size,
  );

  const handleFilterChange = (nextFilter: QuestionFilter): void => {
    setFilter(nextFilter);
    setPage(0);
  };

  const questions = questionPage?.data ?? [];
  const isFiltered =
    filter.query.trim() !== "" || filter.skill !== "all" || filter.status !== "all";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={QUESTIONBANK_TEXT.TITLE}
        subtitle={QUESTIONBANK_TEXT.SUBTITLE}
        actions={
          <button
            type="button"
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
            onClick={() => router.push("/admin/questions/new")}
          >
            + {QUESTIONBANK_TEXT.ADD}
          </button>
        }
      />
      <QuestionStatGrid stats={stats} />
      <QuestionFilters filter={filter} onChange={handleFilterChange} />
      {isError && <Alert tone="error">{QUESTIONBANK_TEXT.LOAD_ERROR}</Alert>}
      {isFetching && questionPage && <Alert tone="info">{QUESTIONBANK_TEXT.SYNCING}</Alert>}
      <QuestionTable
        questions={questions}
        isFiltered={isFiltered}
        onClearFilters={() => handleFilterChange(INITIAL_FILTER)}
      />
      {questionPage && (
        <PaginationControls
          meta={questionPage.meta}
          onPageChange={setPage}
          disabled={isFetching}
          showPageSizeInput
          onPageSizeChange={(nextSize) => {
            setSize(nextSize);
            setPage(0);
          }}
          showFirstLast
          pageSizeLabel={QUESTIONBANK_TEXT.PAGE_SIZE}
          firstLabel={QUESTIONBANK_TEXT.FIRST_PAGE}
          lastLabel={QUESTIONBANK_TEXT.LAST_PAGE}
          totalItemsLabel={QUESTIONBANK_TEXT.TOTAL_QUESTIONS(questionPage.meta.totalElements)}
        />
      )}
    </div>
  );
};
