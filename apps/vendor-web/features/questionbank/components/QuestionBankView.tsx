"use client";

import { type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@pte/ui";
import { QUESTIONBANK_TEXT as RAW_QUESTIONBANK_TEXT } from "../constants";
import { useQuestions } from "../api";
import { QuestionTable } from "./_QuestionTable";
import { useAdminCopy } from "@/features/i18n/adminCopy";

const QUESTION_BANK_LOAD_SIZE = 1000;

export const QuestionBankView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTIONBANK_TEXT);
  const router = useRouter();
  const {
    data: questionPage,
    isError,
    isFetching,
    isLoading,
  } = useQuestions({}, 0, QUESTION_BANK_LOAD_SIZE);

  const questions = questionPage?.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      {isError && <Alert tone="error">{T.LOAD_ERROR}</Alert>}
      {isFetching && questionPage && <Alert tone="info">{T.SYNCING}</Alert>}
      <QuestionTable
        questions={questions}
        isLoading={isLoading}
        toolbarActions={
          <Button type="button" onClick={() => router.push("/admin/questions/new")}>
            + {T.ADD}
          </Button>
        }
      />
    </div>
  );
};
