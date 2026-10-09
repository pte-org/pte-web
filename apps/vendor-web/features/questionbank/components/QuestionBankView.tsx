"use client";

import { type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@pte/ui";
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
      {isError && <Alert tone="error">{QUESTIONBANK_TEXT.LOAD_ERROR}</Alert>}
      {isFetching && questionPage && <Alert tone="info">{QUESTIONBANK_TEXT.SYNCING}</Alert>}
      <QuestionTable
        questions={questions}
        isLoading={isLoading}
        toolbarActions={
          <Button type="button" onClick={() => router.push("/admin/questions/new")}>
            + {QUESTIONBANK_TEXT.ADD}
          </Button>
        }
      />
    </div>
  );
};
