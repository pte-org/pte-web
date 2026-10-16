"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Tabs } from "@pte/ui";
import {
  QUESTION_BANK_TAB_ITEMS,
  QUESTION_BANK_TAB_POOLS,
  QUESTIONBANK_TEXT as RAW_QUESTIONBANK_TEXT,
  type QuestionBankTab,
} from "../constants";
import { useQuestions } from "../api";
import { QuestionTable } from "./_QuestionTable";
import { useAdminCopy } from "@/features/i18n/adminCopy";

const QUESTION_BANK_LOAD_SIZE = 1000;

export const QuestionBankView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTIONBANK_TEXT);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QuestionBankTab>("official");
  const activePool = QUESTION_BANK_TAB_POOLS[activeTab];
  const {
    data: questionPage,
    isError,
    isFetching,
    isLoading,
  } = useQuestions({ pool: activePool }, 0, QUESTION_BANK_LOAD_SIZE);

  const questions = questionPage?.data ?? [];
  const tabItems = useAdminCopy(QUESTION_BANK_TAB_ITEMS);

  const handleTabChange = (value: string): void => {
    const nextTab = QUESTION_BANK_TAB_ITEMS.find((tab) => tab.id === value)?.id;
    if (nextTab) setActiveTab(nextTab);
  };

  return (
    <div className="flex flex-col gap-5">
      {isError && <Alert tone="error">{T.LOAD_ERROR}</Alert>}
      {isFetching && questionPage && <Alert tone="info">{T.SYNCING}</Alert>}
      <Tabs
        id="question-bank-pool-tabs"
        items={tabItems}
        value={activeTab}
        onChange={handleTabChange}
        variant="default"
        ariaLabel={T.POOL_TABS_ARIA_LABEL}
      />
      <QuestionTable
        key={activeTab}
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
