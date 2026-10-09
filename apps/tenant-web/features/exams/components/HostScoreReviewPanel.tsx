"use client";

import { useMemo, useState, type ReactElement } from "react";
import type {
  HostScoreReviewResponse,
  ScoreSourceAuditResponse,
  ScoreSource,
  ScoreSourceSelectionPreviewResponse,
  ScoreSourceSelectionScope,
  SelectScoreSourceRequest,
} from "@pte/api-client";
import {
  Alert,
  Button,
  ConfirmDialog,
  DataTable,
  Select,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  useActiveExaminers,
  useApplyScoreSourceSelection,
  useHostScoreReview,
  usePreviewScoreSourceSelection,
  useScoreSourceSelectionAudits,
} from "../api";

interface HostScoreReviewPanelProps {
  sessionPublicId: string;
}

const EMPTY_ANSWERS: HostScoreReviewResponse["answers"] = [];
const EMPTY_AUDITS: ScoreSourceAuditResponse[] = [];

function displayScore(value: number | null): string {
  return value === null ? "—" : String(value);
}

function formatDate(value: string, locale: "vi" | "en"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const HostScoreReviewPanel = ({
  sessionPublicId,
}: HostScoreReviewPanelProps): ReactElement => {
  const { locale, t } = useLocale();
  const [scope, setScope] = useState<ScoreSourceSelectionScope>("ALL");
  const [section, setSection] = useState("");
  const [taskType, setTaskType] = useState("");
  const [source, setSource] = useState<ScoreSource>("AI");
  const [preview, setPreview] = useState<ScoreSourceSelectionPreviewResponse | null>(null);
  const [request, setRequest] = useState<SelectScoreSourceRequest | null>(null);
  const [pendingApply, setPendingApply] = useState<SelectScoreSourceRequest | null>(null);

  const text = {
    title: t("tenant.scoreReview.title", "Score review"),
    aiEligibleAttempts: t("tenant.scoreReview.aiEligibleAttempts", "AI-eligible attempts"),
    assigned: t("tenant.scoreReview.assigned", "Assigned"),
    unassigned: t("tenant.scoreReview.unassigned", "Unassigned"),
    examinerAnswersPending: t(
      "tenant.scoreReview.examinerAnswersPending",
      "Examiner answers pending",
    ),
    selectedUnavailable: t("tenant.scoreReview.selectedUnavailable", "Selected score unavailable"),
    publicationLocked: t(
      "tenant.scoreReview.publicationLocked",
      "Reports have been published. Score-source changes are locked.",
    ),
    applyScope: t("tenant.scoreReview.applyScope", "Apply scope"),
    allAiEligibleAnswers: t("tenant.scoreReview.allAiEligibleAnswers", "All AI-eligible answers"),
    section: t("tenant.scoreReview.section", "Section"),
    taskType: t("tenant.scoreReview.taskType", "Task type"),
    taskSectionFilter: t("tenant.scoreReview.taskSectionFilter", "Task section filter"),
    selectSection: t("tenant.scoreReview.selectSection", "Select section"),
    selectTaskType: t("tenant.scoreReview.selectTaskType", "Select task type"),
    reportScoreSource: t("tenant.scoreReview.reportScoreSource", "Report score source"),
    aiScore: t("tenant.scoreReview.aiScore", "AI score"),
    examinerScore: t("tenant.scoreReview.examinerScore", "Examiner score"),
    sourceAi: t("tenant.scoreReview.sourceAi", "AI"),
    sourceExaminer: t("tenant.scoreReview.sourceExaminer", "Examiner"),
    statusSubmitted: t("tenant.scoreReview.statusSubmitted", "Submitted"),
    statusNotSubmitted: t("tenant.scoreReview.statusNotSubmitted", "Not submitted"),
    previewSelection: t("tenant.scoreReview.previewSelection", "Preview selection"),
    checking: t("tenant.scoreReview.checking", "Checking…"),
    applySelection: t("tenant.scoreReview.applySelection", "Apply selection"),
    applying: t("tenant.scoreReview.applying", "Applying…"),
    sectionTask: t("tenant.scoreReview.sectionTask", "Section / task"),
    noProvenance: t("tenant.scoreReview.noProvenance", "No provenance"),
    available: t("tenant.scoreReview.available", "available"),
    unavailable: t("tenant.scoreReview.unavailable", "unavailable"),
    examiner: t("tenant.scoreReview.examiner", "Examiner"),
    selected: t("tenant.scoreReview.selected", "Selected"),
    all: t("tenant.scoreReview.all", "All"),
    notSelected: t("tenant.scoreReview.notSelected", "Not selected"),
    assignment: t("tenant.scoreReview.assignment", "Assignment"),
    assignedValue: t("tenant.scoreReview.assignedValue", "Assigned"),
    legacyHost: t("tenant.scoreReview.legacyHost", "Legacy Host"),
    whenActor: t("tenant.scoreReview.whenActor", "When / actor"),
    scopeLabel: t("tenant.scoreReview.scope", "Scope"),
    decision: t("tenant.scoreReview.decision", "Decision"),
    previousCounts: t("tenant.scoreReview.previousCounts", "Previous AI / Examiner / unset"),
    empty: t("tenant.scoreReview.empty", "No answer scores are available yet."),
    sourceHistory: t("tenant.scoreReview.sourceHistory", "Source selection history"),
    loadingHistory: t("tenant.scoreReview.loadingHistory", "Loading history…"),
    unableHistory: t("tenant.scoreReview.unableHistory", "Unable to load score-source history."),
    noSourceChanges: t(
      "tenant.scoreReview.noSourceChanges",
      "No source changes have been recorded for this exam.",
    ),
    answersMatch: (values: {
      matched: number;
      available: number;
      unavailable: number;
      ai: number;
      examiner: number;
      unselected: number;
    }) =>
      t(
        "tenant.scoreReview.answersMatch",
        `${values.matched} answers match; ${values.available} available and ${values.unavailable} unavailable. Current AI/Examiner/unselected: ${values.ai}/${values.examiner}/${values.unselected}.`,
        values,
      ),
    applyConfirm: (values: { source: string; count: number; unavailable: number }) =>
      t(
        "tenant.scoreReview.applyConfirm",
        `Apply ${values.source} to ${values.count} matching answers? ${values.unavailable} unavailable answers will prevent the entire change.`,
        values,
      ),
    applySuccess: (values: { count: number; ai: number; examiner: number; unselected: number }) =>
      t(
        "tenant.scoreReview.applySuccess",
        `Applied ${values.count} score selections; previous AI/Examiner/unselected counts: ${values.ai}/${values.examiner}/${values.unselected}.`,
        values,
      ),
    assignedWithId: (id: string) =>
      t("tenant.scoreReview.assignedWithId", `Assigned (${id})`, { id }),
    answerCount: (count: number) =>
      t("tenant.scoreReview.answerCount", `${count} answers`, { count }),
  };
  const scoreSourceLabel = (value: string | null | undefined): string => {
    if (value === "AI") return text.sourceAi;
    if (value === "EXAMINER") return text.sourceExaminer;
    return text.notSelected;
  };
  const examinerStatusLabel = (value: string): string =>
    value === "SUBMITTED" ? text.statusSubmitted : text.statusNotSubmitted;
  const scopeLabel = (value: string): string => {
    if (value === "ALL") return text.all;
    if (value === "SECTION") return text.section;
    if (value === "TASK_TYPE") return text.taskType;
    return value;
  };
  const scopeOptions = [
    { label: text.allAiEligibleAnswers, value: "ALL" },
    { label: text.section, value: "SECTION" },
    { label: text.taskType, value: "TASK_TYPE" },
  ];
  const sourceOptions = [
    { label: text.aiScore, value: "AI" },
    { label: text.examinerScore, value: "EXAMINER" },
  ];

  const review = useHostScoreReview(sessionPublicId);
  const audits = useScoreSourceSelectionAudits(sessionPublicId);
  const examinerDirectory = useActiveExaminers();
  const previewMutation = usePreviewScoreSourceSelection(sessionPublicId);
  const applyMutation = useApplyScoreSourceSelection(sessionPublicId);
  const answers = review.data?.answers ?? EMPTY_ANSWERS;
  const sections = useMemo(
    () => [
      ...new Set(
        answers.map((answer) => answer.section).filter((value): value is string => Boolean(value)),
      ),
    ],
    [answers],
  );
  const taskTypes = useMemo(
    () => [
      ...new Set(
        answers
          .filter((answer) => !section || answer.section === section)
          .filter(
            (answer) => answer.scoringMethod === "AI_SPEECH" || answer.scoringMethod === "AI_TEXT",
          )
          .map((answer) => answer.taskType),
      ),
    ],
    [answers, section],
  );

  const scopeValue =
    scope === "ALL" ? null : scope === "SECTION" ? section || null : taskType || null;
  const canPreview = Boolean(
    review.data && !review.data.publicationLocked && (scope === "ALL" || scopeValue !== null),
  );

  const openPreview = (): void => {
    if (!review.data || !canPreview) return;
    const nextRequest: SelectScoreSourceRequest = {
      scope,
      scopeValue,
      selectedSource: source,
      expectedReviewVersion: review.data.reviewVersion,
      requestPublicId: null,
    };
    setRequest(nextRequest);
    setPreview(null);
    previewMutation.mutate(nextRequest, { onSuccess: setPreview });
  };

  const apply = (): void => {
    if (!request || !preview?.canApply) return;
    const nextRequest: SelectScoreSourceRequest = request.requestPublicId
      ? { ...request, expectedReviewVersion: preview.reviewVersion }
      : {
          ...request,
          expectedReviewVersion: preview.reviewVersion,
          requestPublicId: crypto.randomUUID(),
        };
    setPendingApply(nextRequest);
  };

  const confirmApply = (): void => {
    if (!pendingApply) return;
    const nextRequest = pendingApply;
    setPendingApply(null);
    setRequest(nextRequest);
    applyMutation.mutate(nextRequest, {
      onSuccess: () => {
        setPreview(null);
        setRequest(null);
      },
    });
  };

  const error = errorMessage(review.error ?? previewMutation.error ?? applyMutation.error);

  const answerColumns: DataTableColumn<HostScoreReviewResponse["answers"][number]>[] = [
    {
      key: "sectionTask",
      header: text.sectionTask,
      filterAccessor: (answer) => `${answer.section ?? ""} ${answer.taskType}`,
      cell: (answer) => (
        <div>
          <div className="font-medium">{answer.section ?? "—"}</div>
          <div className="text-[var(--ink-muted)]">{answer.taskType}</div>
        </div>
      ),
    },
    {
      key: "ai",
      header: "AI",
      filterAccessor: (answer) =>
        `${displayScore(answer.aiRawScore)} ${answer.aiProviderCategory ?? text.noProvenance} ${
          answer.aiProvider ?? ""
        } ${answer.aiAvailable ? text.available : text.unavailable}`,
      cell: (answer) => (
        <>
          {displayScore(answer.aiRawScore)}
          <div className="text-xs text-[var(--ink-muted)]">
            {answer.aiProviderCategory ?? text.noProvenance}
            {answer.aiProvider ? ` · ${answer.aiProvider}` : ""}
            {answer.aiAvailable ? ` · ${text.available}` : ` · ${text.unavailable}`}
          </div>
        </>
      ),
    },
    {
      key: "examiner",
      header: text.examiner,
      filterAccessor: (answer) =>
        `${displayScore(answer.examinerScore)} ${examinerStatusLabel(answer.examinerStatus)}`,
      cell: (answer) => (
        <>
          {displayScore(answer.examinerScore)}
          <div className="text-xs text-[var(--ink-muted)]">
            {examinerStatusLabel(answer.examinerStatus)}
          </div>
        </>
      ),
    },
    {
      key: "selected",
      header: text.selected,
      filterOptions: [
        { label: text.all, value: "" },
        { label: text.sourceAi, value: "AI" },
        { label: text.sourceExaminer, value: "EXAMINER" },
      ],
      filterAccessor: (answer) => scoreSourceLabel(answer.selectedScoreSource),
      cell: (answer) => scoreSourceLabel(answer.selectedScoreSource),
    },
    {
      key: "assignment",
      header: text.assignment,
      filterAccessor: (answer) => {
        if (!answer.assignedExaminerPublicId) return text.unassigned;
        return (
          examinerDirectory.data?.find(
            (examiner) => examiner.publicId === answer.assignedExaminerPublicId,
          )?.fullName ?? answer.assignedExaminerPublicId
        );
      },
      cell: (answer) => (
        <span title={answer.assignedExaminerPublicId ?? undefined}>
          {answer.assignedExaminerPublicId
            ? (examinerDirectory.data?.find(
                (examiner) => examiner.publicId === answer.assignedExaminerPublicId,
              )?.fullName ?? text.assignedWithId(answer.assignedExaminerPublicId.slice(0, 8)))
            : text.unassigned}
        </span>
      ),
    },
    {
      key: "legacyHost",
      header: text.legacyHost,
      filterAccessor: (answer) => displayScore(answer.teacherScore),
      cell: (answer) => displayScore(answer.teacherScore),
    },
  ];

  const auditColumns: DataTableColumn<ScoreSourceAuditResponse>[] = [
    {
      key: "whenActor",
      header: text.whenActor,
      filterAccessor: (audit) => `${audit.occurredAt} ${audit.actorPublicId}`,
      cell: (audit) => (
        <div>
          <div>{formatDate(audit.occurredAt, locale)}</div>
          <div className="text-[var(--ink-muted)]">{audit.actorPublicId.slice(0, 8)}</div>
        </div>
      ),
    },
    {
      key: "scope",
      header: text.scopeLabel,
      filterAccessor: (audit) => `${scopeLabel(audit.scope)} ${audit.scopeValue ?? ""}`,
      cell: (audit) =>
        `${scopeLabel(audit.scope)}${audit.scopeValue ? ` · ${audit.scopeValue}` : ""}`,
    },
    {
      key: "decision",
      header: text.decision,
      filterAccessor: (audit) =>
        `${scoreSourceLabel(audit.selectedSource)} ${audit.affectedAnswerCount}`,
      cell: (audit) =>
        `${scoreSourceLabel(audit.selectedSource)} · ${text.answerCount(audit.affectedAnswerCount)}`,
    },
    {
      key: "previousCounts",
      header: text.previousCounts,
      filterAccessor: (audit) =>
        `${audit.previousAiCount} ${audit.previousExaminerCount} ${audit.previousUnselectedCount}`,
      cell: (audit) =>
        `${audit.previousAiCount} / ${audit.previousExaminerCount} / ${audit.previousUnselectedCount}`,
    },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
      <div>
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">{text.title}</h3>
      </div>

      {review.data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label={text.aiEligibleAttempts} value={review.data.aiEligibleAttemptCount} />
          <Metric label={text.assigned} value={review.data.assignedAttemptCount} />
          <Metric label={text.unassigned} value={review.data.unassignedAttemptCount} />
          <Metric
            label={text.examinerAnswersPending}
            value={review.data.pendingExaminerAnswerCount}
          />
          <Metric
            label={text.selectedUnavailable}
            value={review.data.unavailableSelectedAnswerCount}
          />
        </div>
      )}

      {review.data?.publicationLocked && <Alert tone="warning">{text.publicationLocked}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {applyMutation.isSuccess && (
        <Alert tone="success">
          {text.applySuccess({
            count: applyMutation.data.affectedAnswerCount,
            ai: applyMutation.data.previousAiCount,
            examiner: applyMutation.data.previousExaminerCount,
            unselected: applyMutation.data.previousUnselectedCount,
          })}
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-4 md:items-end">
        <Select
          label={text.applyScope}
          value={scope}
          onChange={(event) => {
            setScope(event.target.value as ScoreSourceSelectionScope);
            setPreview(null);
          }}
          options={scopeOptions}
        />
        {scope !== "ALL" && (
          <Select
            label={scope === "SECTION" ? text.section : text.taskSectionFilter}
            value={section}
            onChange={(event) => {
              setSection(event.target.value);
              setTaskType("");
              setPreview(null);
            }}
            options={sections.map((value) => ({ label: value, value }))}
            placeholder={text.selectSection}
          />
        )}
        {scope === "TASK_TYPE" && (
          <Select
            label={text.taskType}
            value={taskType}
            onChange={(event) => {
              setTaskType(event.target.value);
              setPreview(null);
            }}
            options={taskTypes.map((value) => ({ label: value, value }))}
            placeholder={text.selectTaskType}
          />
        )}
        <Select
          label={text.reportScoreSource}
          value={source}
          onChange={(event) => {
            setSource(event.target.value as ScoreSource);
            setPreview(null);
          }}
          options={sourceOptions}
        />
        <Button
          type="button"
          onClick={openPreview}
          disabled={!canPreview || review.isLoading || previewMutation.isPending}
        >
          {previewMutation.isPending ? text.checking : text.previewSelection}
        </Button>
      </div>

      {preview && (
        <div className="flex flex-col gap-3 rounded-md bg-[var(--surface-subtle)] p-4 text-sm">
          <p>
            {text.answersMatch({
              matched: preview.matchedAnswerCount,
              available: preview.availableAnswerCount,
              unavailable: preview.unavailableAnswerCount,
              ai: preview.currentAiCount,
              examiner: preview.currentExaminerCount,
              unselected: preview.currentUnselectedCount,
            })}
          </p>
          {!preview.canApply && (
            <Alert tone="warning">
              {t(
                "tenant.scoreReview.noChanges",
                "Nothing changed. Resolve unavailable scores or refresh the review before applying this selection.",
              )}
            </Alert>
          )}
          <div>
            <Button
              type="button"
              onClick={apply}
              disabled={!preview.canApply || applyMutation.isPending}
            >
              {applyMutation.isPending ? text.applying : text.applySelection}
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={answerColumns}
        rows={answers}
        getRowKey={(answer) => answer.answerPublicId}
        isLoading={review.isLoading}
        emptyTitle={text.empty}
      />

      <details className="rounded-md border border-[var(--shell-border)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--ink-primary)]">
          {text.sourceHistory} {audits.data ? `(${audits.data.length})` : ""}
        </summary>
        {audits.isLoading ? (
          <p className="mt-3 text-sm text-[var(--ink-secondary)]">{text.loadingHistory}</p>
        ) : null}
        {audits.error ? (
          <Alert className="mt-3" tone="error">
            {text.unableHistory}
          </Alert>
        ) : null}
        <div className="mt-3">
          <DataTable
            columns={auditColumns}
            rows={audits.data ?? EMPTY_AUDITS}
            getRowKey={(audit) => audit.auditPublicId}
            isLoading={audits.isLoading}
            emptyTitle={text.noSourceChanges}
          />
        </div>
      </details>
      <ConfirmDialog
        open={pendingApply !== null}
        title={t("tenant.scoreReview.applyTitle", "Apply score source?")}
        description={text.applyConfirm({
          source: pendingApply?.selectedSource ?? "",
          count: preview?.matchedAnswerCount ?? 0,
          unavailable: preview?.unavailableAnswerCount ?? 0,
        })}
        confirmLabel={text.applySelection}
        onConfirm={confirmApply}
        onClose={() => setPendingApply(null)}
      />
    </div>
  );
};

function Metric({ label, value }: { label: string; value: number }): ReactElement {
  return (
    <div className="rounded-md bg-[var(--surface-subtle)] p-3">
      <div className="text-xs text-[var(--ink-secondary)]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[var(--ink-primary)]">{value}</div>
    </div>
  );
}
