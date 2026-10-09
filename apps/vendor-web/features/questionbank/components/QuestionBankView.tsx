"use client";

import { type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, PageHeader } from "@pte/ui";
import { QUESTIONBANK_TEXT } from "../constants";
import { useQuestions } from "../api";
import { QuestionTable } from "./_QuestionTable";

const QUESTION_BANK_LOAD_SIZE = 1000;

export const QuestionBankView = (): ReactElement => {
  const router = useRouter();
  const { data: questionPage, isError, isFetching, isLoading } = useQuestions(
    {},
    0,
    QUESTION_BANK_LOAD_SIZE,
  );

  const questions = questionPage?.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={QUESTIONBANK_TEXT.TITLE}
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
      {isError && <Alert tone="error">{QUESTIONBANK_TEXT.LOAD_ERROR}</Alert>}
      {isFetching && questionPage && <Alert tone="info">{QUESTIONBANK_TEXT.SYNCING}</Alert>}
      <QuestionTable
        questions={questions}
        isLoading={isLoading}
      />
    </div>
  );
};
