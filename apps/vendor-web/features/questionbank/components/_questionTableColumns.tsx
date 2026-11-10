import type { ReactElement } from "react";
import { Badge, Chip, type DataTableColumn } from "@pte/ui";
import {
  CEFR_LEVELS,
  QUESTIONBANK_TEXT as RAW_QUESTIONBANK_TEXT,
  QUESTION_POOL_LABELS as RAW_QUESTION_POOL_LABELS,
  QUESTION_SKILL_LABELS as RAW_QUESTION_SKILL_LABELS,
  QUESTION_STATUS_LABELS as RAW_QUESTION_STATUS_LABELS,
  QUESTION_STATUS_VARIANT,
  QUESTION_TABLE_HEADERS as RAW_QUESTION_TABLE_HEADERS,
} from "../constants";
import type { Question } from "../types";
import { POOL_TONE, cefrTone, sectionTone } from "@/lib/chipTones";
import { useAdminCopy } from "@/features/i18n/adminCopy";

/** READ_ALOUD -> "Read Aloud"; the bank stores task types as codes. */
export const taskTypeLabel = (code: string): string =>
  code.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

/**
 * Columns of the question bank table. The task-type filter lists only the task types present in the rows it is
 * given, so once the list is narrowed to one skill on the left it offers that skill's task types only.
 */
export const useQuestionTableColumns = (
  questions: Question[],
  showSkillColumn: boolean,
): DataTableColumn<Question>[] => {
  const T = useAdminCopy(RAW_QUESTIONBANK_TEXT);
  const H = useAdminCopy(RAW_QUESTION_TABLE_HEADERS);
  const skillLabels = useAdminCopy(RAW_QUESTION_SKILL_LABELS);
  const [allTaskTypes] = useAdminCopy(["All task types"]);
  const taskTypeFilterOptions = [
    { value: "", label: allTaskTypes },
    ...[...new Set(questions.map((question) => question.taskType))].sort()
      .map((taskType) => ({ value: taskType, label: taskTypeLabel(taskType) })),
  ];
  const cefrFilterOptions = [
    { value: "", label: H.CEFR },
    ...CEFR_LEVELS.map((level) => ({ value: level, label: level })),
  ];
  const sourceFilterOptions = useAdminCopy([
    { value: "", label: "All sources" },
    { value: "ai", label: "AI generated" },
    { value: "manual", label: "Manual" },
  ]);
  const sourceLabels = useAdminCopy({ ai: "AI generated", manual: "Manual" } as const);
  const poolLabels = useAdminCopy(RAW_QUESTION_POOL_LABELS);
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
            filterAccessor: (question) => question.content,
            cell: (question: Question): ReactElement => (
              <span className="line-clamp-1 max-w-md">{question.content}</span>
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
                {taskTypeLabel(question.taskType)}
              </span>
            ),
          },
          {
            key: "pool",
            label: H.POOL,
            header: H.POOL,
            filterAccessor: (question) => question.pool,
            cell: (question) => <Chip tone={POOL_TONE}>{poolLabels[question.pool]}</Chip>,
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
  ];
};
