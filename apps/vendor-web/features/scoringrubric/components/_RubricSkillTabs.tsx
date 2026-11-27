"use client";

import type { ReactElement } from "react";
import {
  AllSectionsIcon,
  BookOpenIcon,
  HeadphoneIcon,
  MicIcon,
  PencilIcon,
  cn,
  useLocale,
} from "@pte/ui";
import { RUBRIC_SKILL_FILTER_ALL } from "../constants";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import type { TaskTypeRubricResponse } from "../types";

export interface RubricSkillTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  taskTypes: readonly TaskTypeRubricResponse[];
}

export const RubricSkillTabs = ({
  activeTab,
  onTabChange,
  taskTypes,
}: RubricSkillTabsProps): ReactElement => {
  const { messages: M, codeLabel } = useScoringRubricText();
  const { locale } = useLocale();

  const inSkill = (tab: string) => (rubric: TaskTypeRubricResponse) =>
    tab === RUBRIC_SKILL_FILTER_ALL || (rubric.skills as readonly string[]).includes(tab);

  const tabs = [
    {
      id: RUBRIC_SKILL_FILTER_ALL,
      label: M.skillAll,
      subLabel: undefined,
      icon: AllSectionsIcon,
      iconBg: "bg-[var(--surface-subtle)] text-[var(--ink-secondary)]",
      count: taskTypes.length,
      tooltip:
        locale === "vi"
          ? "Tổng 22 dạng bài PTE. Các kỹ năng cộng lại (30) lớn hơn 22 do một số dạng bài chấm chéo cho 2 kỹ năng."
          : "Total 22 PTE task types. Total of skill counts (30) is greater than 22 because multiple task types feed cross-skills.",
    },
    {
      id: "SPEAKING",
      label: codeLabel("skill", "SPEAKING"),
      subLabel: "Speaking",
      icon: MicIcon,
      iconBg: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
      count: taskTypes.filter(inSkill("SPEAKING")).length,
    },
    {
      id: "WRITING",
      label: codeLabel("skill", "WRITING"),
      subLabel: "Writing",
      icon: PencilIcon,
      iconBg: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
      count: taskTypes.filter(inSkill("WRITING")).length,
    },
    {
      id: "READING",
      label: codeLabel("skill", "READING"),
      subLabel: "Reading",
      icon: BookOpenIcon,
      iconBg: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
      count: taskTypes.filter(inSkill("READING")).length,
    },
    {
      id: "LISTENING",
      label: codeLabel("skill", "LISTENING"),
      subLabel: "Listening",
      icon: HeadphoneIcon,
      iconBg: "bg-[var(--blush-tint)] text-[var(--blush-action)]",
      count: taskTypes.filter(inSkill("LISTENING")).length,
    },
  ];

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onTabChange(tabs[nextIndex].id);
      document.getElementById(`rubric-skill-tab-${tabs[nextIndex].id}`)?.focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prevIndex].id);
      document.getElementById(`rubric-skill-tab-${tabs[prevIndex].id}`)?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={M.skillFilterLabel}
      className="flex flex-wrap items-center gap-2 pt-0.5 pb-0.5"
    >
      {tabs.map((item, index) => {
        const isSelected = item.id === activeTab;
        return (
          <button
            key={item.id}
            id={`rubric-skill-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onTabChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            title={item.tooltip}
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
  );
};
