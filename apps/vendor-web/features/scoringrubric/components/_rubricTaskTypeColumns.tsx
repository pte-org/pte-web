"use client";

import { useMemo, type ReactElement } from "react";
import Link from "next/link";
import {
  Badge,
  Chip,
  EyeIcon,
  InfoIcon,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
import { PER_WORD_MAX_SYMBOL, scoringRubricDetailHref } from "../constants";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { formatRubricMaxTotal, hasEnabledGate } from "../rubricView";
import type { TaskTypeRubricResponse } from "../types";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { sectionTone } from "@/lib/chipTones";

/**
 * Generic fallback that formats a task type code (e.g. "READ_ALOUD") into Title Case
 * if the database displayName is not available.
 */
export const taskTypeLabel = (code: string): string =>
  (code ?? "")
    .split("_")
    .map((word) => {
      const upper = word.toUpperCase();
      if (upper === "MC" || upper === "AI" || upper === "PTE" || upper === "FIB") return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

export const useRubricTaskTypeColumns = (
  versionId?: string,
): DataTableColumn<TaskTypeRubricResponse>[] => {
  const { messages: M, codeLabel } = useScoringRubricText();
  const { locale } = useLocale();
  const { data: dbQuestionTypes = [] } = useQuestionTypes(false);

  const taskTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of dbQuestionTypes) {
      if (item.code && item.displayName) {
        map.set(item.code.toUpperCase(), item.displayName);
      }
    }
    return map;
  }, [dbQuestionTypes]);

  const getTaskTypeLabel = (code: string): string => {
    return taskTypeMap.get(code.toUpperCase()) ?? taskTypeLabel(code);
  };

  return [
    {
      key: "taskType",
      header: M.columnTaskType,
      sortable: false,
      cell: (rubric: TaskTypeRubricResponse): ReactElement => {
        const displayName = getTaskTypeLabel(rubric.taskType);
        const detailHref = scoringRubricDetailHref(rubric.taskType, versionId);
        return (
          <Link
            href={detailHref}
            className="group/item flex flex-col text-left transition-colors focus:outline-none"
          >
            <span className="font-semibold text-sm text-[var(--ink-primary)] group-hover/item:text-[var(--action)] group-hover/item:underline">
              {displayName}
            </span>
            <span className="font-mono text-xs text-[var(--ink-tertiary)]">
              {rubric.taskType}
            </span>
          </Link>
        );
      },
    },
    {
      key: "skills",
      header: M.columnSkills,
      sortable: false,
      cell: (rubric: TaskTypeRubricResponse): ReactElement => (
        <span className="flex flex-wrap items-center gap-1.5">
          {rubric.skills.map((skill) => (
            <Chip key={skill} tone={sectionTone(skill)}>
              {codeLabel("skill", skill)}
            </Chip>
          ))}
        </span>
      ),
    },
    {
      key: "traits",
      header: <div className="text-center">{M.columnTraits}</div>,
      sortable: false,
      headerClassName: "text-center",
      cellClassName: "text-center",
      className: "text-center",
      cell: (rubric: TaskTypeRubricResponse): ReactElement => (
        <div className="flex flex-col items-center justify-center gap-0.5">
          {rubric.traits.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[var(--ink-primary)]">{rubric.traits.length}</span>
              <span className="text-xs text-[var(--ink-secondary)]">({locale === "vi" ? "Chấm AI" : "AI Rubric"})</span>
            </div>
          ) : (
            <span className="text-xs text-[var(--ink-secondary)]">{M.answerKey}</span>
          )}
        </div>
      ),
    },
    {
      key: "gate",
      header: <div className="text-center">{M.columnGate}</div>,
      sortable: false,
      headerClassName: "text-center",
      cellClassName: "text-center",
      className: "text-center",
      cell: (rubric: TaskTypeRubricResponse): ReactElement => (
        <div className="flex justify-center">
          {hasEnabledGate(rubric) ? (
            <span
              title={
                locale === "vi"
                  ? "Nếu tiêu chí chặn bị 0 điểm thì cả câu bị 0 điểm (chặn điểm bài thi)"
                  : "Scores 0 on the whole item if this gate trait scores 0"
              }
            >
              <Badge variant="warning">
                {locale === "vi" ? "Chặn điểm 0" : M.gateBadge}
              </Badge>
            </span>
          ) : (
            <span className="text-[var(--ink-tertiary)] font-medium select-none">—</span>
          )}
        </div>
      ),
    },
    {
      key: "maxTotal",
      header: <div className="text-center">{M.columnMaxTotal}</div>,
      sortable: false,
      headerClassName: "text-center",
      cellClassName: "text-center",
      className: "text-center",
      cell: (rubric: TaskTypeRubricResponse): ReactElement => {
        const formatted = formatRubricMaxTotal(rubric.traits, PER_WORD_MAX_SYMBOL);
        if (!formatted) {
          return (
            <div className="text-center">
              <span className="text-xs text-[var(--ink-secondary)]">{M.answerKey}</span>
            </div>
          );
        }
        const hasPerWord = rubric.traits.some((t) => t.perWord);
        if (hasPerWord) {
          return (
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-medium text-[var(--ink-primary)]">{formatted}</span>
              <span
                title={locale === "vi" ? "N = tổng số từ trong đoạn văn" : "N = total word count in passage"}
                className="inline-flex cursor-help items-center text-[var(--ink-tertiary)] hover:text-[var(--action)]"
              >
                <InfoIcon className="h-3.5 w-3.5" />
              </span>
            </div>
          );
        }
        return (
          <div className="text-center">
            <span className="text-sm font-medium text-[var(--ink-primary)]">{formatted}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: <div className="text-right">{M.columnActions}</div>,
      sortable: false,
      headerClassName: "text-right",
      cellClassName: "text-right",
      className: "text-right",
      cell: (rubric: TaskTypeRubricResponse): ReactElement => (
        <div className="flex justify-end">
          <Link
            href={scoringRubricDetailHref(rubric.taskType, versionId)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--action)] transition-colors"
            aria-label={`${M.viewDetail}: ${rubric.taskType}`}
            title={M.viewDetail}
          >
            <EyeIcon className="h-4 w-4" />
            {M.actionView}
          </Link>
        </div>
      ),
    },
  ];
};
