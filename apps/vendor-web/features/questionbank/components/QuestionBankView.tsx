"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, TabRailCard, Tabs } from "@pte/ui";
import {
  QUESTION_BANK_TAB_ITEMS,
  QUESTION_BANK_TAB_POOLS,
  QUESTIONBANK_TEXT as RAW_QUESTIONBANK_TEXT,
  type QuestionBankTab,
} from "../constants";
import { useQuestions } from "../api";
import { sortByStatusRank } from "../questionOrder";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { QuestionTable } from "./_QuestionTable";
import { SCORE_TEMPLATE_ALL_TAB } from "@/features/scoretemplate/constants";
import { useSectionTabItems } from "@/features/scoretemplate/useSectionTabItems";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { GenerationDrawer, GenerationProgressTray } from "@/features/questiongeneration/components";
import { generationMessages } from "@/features/questiongeneration/messages/en";

const QUESTION_BANK_LOAD_SIZE = 1000;

export const QuestionBankView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTIONBANK_TEXT);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QuestionBankTab>("official");
  const [section, setSection] = useState(SCORE_TEMPLATE_ALL_TAB);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [aiFilter, setAiFilter] = useState<"all" | "ai" | "manual">("all");
  // Not shown here: it warms the cache the detail page reads, so opening a question needs no extra wait.
  useQuestionTypes(false);
  const activePool = QUESTION_BANK_TAB_POOLS[activeTab];
  const {
    data: questionPage,
    isError,
    isLoading,
    isPlaceholderData,
  } = useQuestions(
    {
      pool: activePool,
      aiGenerated: aiFilter === "all" ? undefined : aiFilter === "ai",
    },
    0,
    QUESTION_BANK_LOAD_SIZE,
  );

  // After a pool switch the previous pool's rows linger as placeholder data; show a skeleton instead.
  const allQuestions = isPlaceholderData ? [] : (questionPage?.data ?? []);
  const questions = sortByStatusRank(
    section === SCORE_TEMPLATE_ALL_TAB
      ? allQuestions
      : allQuestions.filter((question) => question.skill.toUpperCase() === section),
  );
  const sectionItems = useSectionTabItems((value) =>
    value === null
      ? allQuestions.length
      : allQuestions.filter((question) => question.skill.toUpperCase() === value).length,
  );
  const tabItems = useAdminCopy(QUESTION_BANK_TAB_ITEMS);

  const handleTabChange = (value: string): void => {
    const nextTab = QUESTION_BANK_TAB_ITEMS.find((tab) => tab.id === value)?.id;
    if (nextTab) setActiveTab(nextTab);
  };

  return (
    <div className="flex flex-col gap-5">
      {isError && <Alert tone="error">{T.LOAD_ERROR}</Alert>}

      {/* Generation Progress Tray */}
      {activeJobId && (
        <GenerationProgressTray
          jobId={activeJobId}
          onJobComplete={(job) => {
            setActiveJobId(null);
            // Refresh questions list
          }}
          onReviewClick={(jobId) => {
            router.push(`/admin/questions/ai-review?job=${jobId}`);
          }}
        />
      )}

      <Tabs
        id="question-bank-pool-tabs"
        items={tabItems}
        value={activeTab}
        onChange={handleTabChange}
        variant="default"
        ariaLabel={T.POOL_TABS_ARIA_LABEL}
      />
      <TabRailCard
        id="question-bank-section-tabs"
        items={sectionItems}
        value={section}
        onChange={setSection}
      >
        {/* Source Filter */}
        <div className="flex gap-2 mb-4 px-0">
          <button
            onClick={() => setAiFilter("all")}
            className={`px-3 py-1 rounded text-sm transition-all ${
              aiFilter === "all"
                ? "bg-gray-700 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setAiFilter("ai")}
            className={`px-3 py-1 rounded text-sm transition-all ${
              aiFilter === "ai"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            AI Generated
          </button>
          <button
            onClick={() => setAiFilter("manual")}
            className={`px-3 py-1 rounded text-sm transition-all ${
              aiFilter === "manual"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Manual
          </button>
        </div>

        <QuestionTable
          key={activeTab}
          questions={questions}
          isLoading={isLoading || isPlaceholderData}
          showSkillColumn={section === SCORE_TEMPLATE_ALL_TAB}
          toolbarActions={
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setDrawerOpen(true)}
                variant="secondary"
              >
                ✦ {generationMessages.generatingTitle}
              </Button>
              <Button type="button" onClick={() => router.push("/admin/questions/new")}>
                + {T.ADD}
              </Button>
            </div>
          }
        />
      </TabRailCard>

      {/* Generation Drawer */}
      <GenerationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onJobCreated={(jobId) => {
          setActiveJobId(jobId);
          setDrawerOpen(false);
        }}
      />
    </div>
  );
};
