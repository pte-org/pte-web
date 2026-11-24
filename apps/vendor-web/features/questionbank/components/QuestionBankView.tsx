"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AllSectionsIcon,
  BookOpenIcon,
  Button,
  HeadphoneIcon,
  MicIcon,
  PencilIcon,
  Tabs,
  cn,
  useRememberedState,
} from "@pte/ui";
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
import { useAdminCopy } from "@/features/i18n/adminCopy";

const QUESTION_BANK_LOAD_SIZE = 1000;

export const QuestionBankView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTIONBANK_TEXT);
  const router = useRouter();
  const [activeTab, setActiveTab] = useRememberedState<QuestionBankTab>("pool", "official", QUESTION_BANK_TAB_ITEMS.map((tab) => tab.id));
  const [section, setSection] = useRememberedState<string>("section", SCORE_TEMPLATE_ALL_TAB);
  // Not shown here: it warms the cache the detail page reads, so opening a question needs no extra wait.
  useQuestionTypes(false);
  const activePool = QUESTION_BANK_TAB_POOLS[activeTab];
  const otherPool = activeTab === "official" ? "PRACTICE" : "EXAM";
  const {
    data: questionPage,
    isError,
    isLoading,
    isPlaceholderData,
  } = useQuestions(
    { pool: activePool },
    0,
    QUESTION_BANK_LOAD_SIZE,
  );
  // Fast 1-item query to fetch the count of the other pool without loading full list
  const { data: otherPoolPage } = useQuestions({ pool: otherPool }, 0, 1);

  const officialCount =
    activeTab === "official"
      ? (questionPage?.meta?.totalElements ?? questionPage?.data?.length)
      : (otherPoolPage?.meta?.totalElements ?? otherPoolPage?.data?.length);
  const practiceCount =
    activeTab === "practice"
      ? (questionPage?.meta?.totalElements ?? questionPage?.data?.length)
      : (otherPoolPage?.meta?.totalElements ?? otherPoolPage?.data?.length);

  // After a pool switch the previous pool's rows linger as placeholder data; show a skeleton instead.
  const allQuestions = isPlaceholderData ? [] : (questionPage?.data ?? []);
  const questions = sortByStatusRank(
    section === SCORE_TEMPLATE_ALL_TAB
      ? allQuestions
      : allQuestions.filter((question) => question.skill.toUpperCase() === section),
  );
  const allSectionsLabel = useAdminCopy("All sections");
  const sectionLabels = useAdminCopy({
    SPEAKING: "Speaking",
    WRITING: "Writing",
    READING: "Reading",
    LISTENING: "Listening",
  });

  const sectionCounts: Record<string, number> = {
    [SCORE_TEMPLATE_ALL_TAB]: allQuestions.length,
    SPEAKING: allQuestions.filter((q) => q.skill.toUpperCase() === "SPEAKING").length,
    WRITING: allQuestions.filter((q) => q.skill.toUpperCase() === "WRITING").length,
    READING: allQuestions.filter((q) => q.skill.toUpperCase() === "READING").length,
    LISTENING: allQuestions.filter((q) => q.skill.toUpperCase() === "LISTENING").length,
  };

  const tabs = [
    {
      id: SCORE_TEMPLATE_ALL_TAB,
      label: allSectionsLabel,
      subLabel: undefined,
      icon: AllSectionsIcon,
      iconBg: "bg-[var(--surface-subtle)] text-[var(--ink-secondary)]",
      count: sectionCounts[SCORE_TEMPLATE_ALL_TAB],
    },
    {
      id: "SPEAKING",
      label: sectionLabels.SPEAKING,
      subLabel: "Speaking",
      icon: MicIcon,
      iconBg: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
      count: sectionCounts.SPEAKING,
    },
    {
      id: "WRITING",
      label: sectionLabels.WRITING,
      subLabel: "Writing",
      icon: PencilIcon,
      iconBg: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
      count: sectionCounts.WRITING,
    },
    {
      id: "READING",
      label: sectionLabels.READING,
      subLabel: "Reading",
      icon: BookOpenIcon,
      iconBg: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
      count: sectionCounts.READING,
    },
    {
      id: "LISTENING",
      label: sectionLabels.LISTENING,
      subLabel: "Listening",
      icon: HeadphoneIcon,
      iconBg: "bg-[var(--blush-tint)] text-[var(--blush-action)]",
      count: sectionCounts.LISTENING,
    },
  ];

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      setSection(tabs[nextIndex].id);
      document.getElementById(`section-tab-${tabs[nextIndex].id}`)?.focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      setSection(tabs[prevIndex].id);
      document.getElementById(`section-tab-${tabs[prevIndex].id}`)?.focus();
    }
  };

  const tabLabels = useAdminCopy({
    official: "Official",
    practice: "Practice",
  });

  const tabItems = [
    {
      id: "official",
      label: tabLabels.official,
      count: officialCount,
    },
    {
      id: "practice",
      label: tabLabels.practice,
      count: practiceCount,
    },
  ];

  const handleTabChange = (value: string): void => {
    const nextTab = QUESTION_BANK_TAB_ITEMS.find((tab) => tab.id === value)?.id;
    if (nextTab) setActiveTab(nextTab);
  };

  return (
    <div className="flex flex-col gap-5">
      {isError && <Alert tone="error">{T.LOAD_ERROR}</Alert>}

      <Tabs
        id="question-bank-pool-tabs"
        items={tabItems}
        value={activeTab}
        onChange={handleTabChange}
        variant="minimal"
        ariaLabel={T.POOL_TABS_ARIA_LABEL}
      />
      {/* Horizontal Section Filter Pills */}
      <div
        role="tablist"
        aria-label={allSectionsLabel}
        className="flex flex-wrap items-center gap-2 pt-1 pb-0.5"
      >
        {tabs.map((item, index) => {
          const isSelected = item.id === section;
          return (
            <button
              key={item.id}
              id={`section-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSection(item.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={cn(
                "group inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
                isSelected
                  ? "border border-blue-200 bg-blue-50/90 text-blue-700 shadow-2xs dark:border-blue-800/80 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                  : "border border-[var(--shell-border)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)] shadow-2xs",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  isSelected
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                    : item.iconBg,
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
              </span>
              <span className="flex items-baseline gap-1">
                <span>{item.label}</span>
                {item.subLabel && item.label !== item.subLabel && (
                  <span
                    className={cn(
                      "text-xs font-normal",
                      isSelected
                        ? "text-blue-600/75 dark:text-blue-400/80"
                        : "text-gray-400 dark:text-gray-500",
                    )}
                  >
                    ({item.subLabel})
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors",
                  isSelected
                    ? "bg-blue-200/70 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
                    : "bg-[var(--surface-subtle)] text-[var(--ink-secondary)] group-hover:bg-gray-200/80 dark:group-hover:bg-gray-700",
                )}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      <QuestionTable
        key={activeTab}
        questions={questions}
        isLoading={isLoading || isPlaceholderData}
        showSkillColumn={section === SCORE_TEMPLATE_ALL_TAB}
        toolbarActions={
          <Button type="button" onClick={() => router.push("/admin/questions/new")}>
            + {T.ADD}
          </Button>
        }
      />
    </div>
  );
};
