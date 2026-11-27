import { useMemo, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Badge, Chip, type DataTableColumn } from "@pte/ui";
import {
  CEFR_LEVELS,
  QUESTIONBANK_TEXT as RAW_QUESTIONBANK_TEXT,
  QUESTION_SKILL_LABELS as RAW_QUESTION_SKILL_LABELS,
  QUESTION_STATUS_LABELS as RAW_QUESTION_STATUS_LABELS,
  QUESTION_STATUS_VARIANT,
  QUESTION_TABLE_HEADERS as RAW_QUESTION_TABLE_HEADERS,
} from "../constants";
import type { Question } from "../types";
import { cefrTone, sectionTone } from "@/lib/chipTones";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useQuestionTypes } from "@/features/questiontemplate/api";

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

/**
 * Columns of the question bank table. The task-type filter lists only the task types present in the rows it is
 * given, so once the list is narrowed to one skill on the left it offers that skill's task types only.
 */
export const useQuestionTableColumns = (
  questions: Question[],
  showSkillColumn: boolean,
): DataTableColumn<Question>[] => {
  const router = useRouter();
  const T = useAdminCopy(RAW_QUESTIONBANK_TEXT);
  const H = useAdminCopy(RAW_QUESTION_TABLE_HEADERS);
  const skillLabels = useAdminCopy(RAW_QUESTION_SKILL_LABELS);
  const [allTaskTypes, allCefr] = useAdminCopy(["All task types", "All CEFR levels"]);
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

  const taskTypeFilterOptions = [
    { value: "", label: allTaskTypes },
    ...[...new Set(questions.map((question) => question.taskType))].sort()
      .map((taskType) => ({ value: taskType, label: getTaskTypeLabel(taskType) })),
  ];
  const cefrFilterOptions = [
    { value: "", label: allCefr },
    ...CEFR_LEVELS.map((level) => ({ value: level, label: level })),
  ];
  const sourceFilterOptions = useAdminCopy([
    { value: "", label: "All sources" },
    { value: "ai", label: "AI generated" },
    { value: "manual", label: "Manual" },
  ]);
  const sourceLabels = useAdminCopy({ ai: "AI generated", manual: "Manual" } as const);
  const statusLabels = useAdminCopy(RAW_QUESTION_STATUS_LABELS);
  const statusFilterOptions = useAdminCopy([
    { value: "", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "pending_approval", label: "Pending approval" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ]);

  return [

          ...(showSkillColumn
            ? [
                {
                  key: "skill",
                  label: H.SKILL,
                  header: H.SKILL,
                  cell: (question: Question): ReactElement => (
                    <Chip tone={sectionTone(question.skill)}>{skillLabels[question.skill]}</Chip>
                  ),
                },
              ]
            : []),
          {
            key: "content",
            label: H.CONTENT,
            header: H.CONTENT,
            sortable: false,
            filterAccessor: (question) => question.content,
            cell: (question: Question): ReactElement => (
              <button
                type="button"
                onClick={() => router.push(`/admin/questions/${question.id}`)}
                className="group/item flex flex-col text-left transition-colors focus:outline-none"
              >
                <span className="line-clamp-2 max-w-xl text-sm font-medium text-[var(--ink-primary)] group-hover/item:text-[var(--action)] group-hover/item:underline">
                  {question.content}
                </span>
              </button>
            ),
          },
          {
            key: "taskType",
            label: H.TASK_TYPE,
            header: H.TASK_TYPE,
            filterOptions: taskTypeFilterOptions,
            filterAccessor: (question) => question.taskType,
            cell: (question) => (
              <span className="whitespace-nowrap text-xs font-medium text-[var(--ink-secondary)]">
                {getTaskTypeLabel(question.taskType)}
              </span>
            ),
          },
          {
            key: "cefr",
            label: H.CEFR,
            header: H.CEFR,
            filterOptions: cefrFilterOptions,
            filterAccessor: (question) => question.cefrLevel ?? "",
            cell: (question) =>
              question.cefrLevel ? (
                <Chip tone={cefrTone(question.cefrLevel)}>{question.cefrLevel}</Chip>
              ) : (
                T.EMPTY_VALUE
              ),
          },
          {
            key: "source",
            label: H.SOURCE,
            header: H.SOURCE,
            filterOptions: sourceFilterOptions,
            filterAccessor: (question) => (question.generationMeta != null ? "ai" : "manual"),
            cell: (question) =>
              question.generationMeta != null ? (
                <Badge variant="info">{sourceLabels.ai}</Badge>
              ) : (
                <span>{sourceLabels.manual}</span>
              ),
          },
          {
            key: "status",
            label: H.STATUS,
            header: H.STATUS,
            filterOptions: statusFilterOptions,
            filterAccessor: (question) => question.status,
            cell: (question) => (
              <Badge variant={QUESTION_STATUS_VARIANT[question.status]}>
                {statusLabels[question.status]}
              </Badge>
            ),
          },
          {
            key: "updatedAt",
            label: H.UPDATED_AT,
            header: H.UPDATED_AT,
            sortAccessor: (question: Question) =>
              question.updatedAt ? new Date(question.updatedAt).getTime() : 0,
            cell: (question: Question): ReactElement => {
              if (!question.updatedAt) return <span>{T.EMPTY_VALUE}</span>;
              try {
                const date = new Date(question.updatedAt);
                const formatted = isNaN(date.getTime())
                  ? T.EMPTY_VALUE
                  : date.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                return (
                  <span className="whitespace-nowrap text-xs text-[var(--ink-secondary)]">
                    {formatted}
                  </span>
                );
              } catch {
                return <span>{T.EMPTY_VALUE}</span>;
              }
            },
            className: "whitespace-nowrap",
          },
  ];
};
