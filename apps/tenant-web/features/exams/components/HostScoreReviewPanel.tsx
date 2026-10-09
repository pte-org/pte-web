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

const SCOPE_OPTIONS = [
  { label: "All AI-eligible answers", value: "ALL" },
  { label: "Section", value: "SECTION" },
  { label: "Task type", value: "TASK_TYPE" },
];
const SOURCE_OPTIONS = [
  { label: "AI score", value: "AI" },
  { label: "Examiner score", value: "EXAMINER" },
];
const EMPTY_ANSWERS: HostScoreReviewResponse["answers"] = [];
const EMPTY_AUDITS: ScoreSourceAuditResponse[] = [];

function displayScore(value: number | null): string {
  return value === null ? "—" : String(value);
}

export const HostScoreReviewPanel = ({
  sessionPublicId,
}: HostScoreReviewPanelProps): ReactElement => {
  const [scope, setScope] = useState<ScoreSourceSelectionScope>("ALL");
  const [section, setSection] = useState("");
  const [taskType, setTaskType] = useState("");
  const [source, setSource] = useState<ScoreSource>("AI");
  const [preview, setPreview] = useState<ScoreSourceSelectionPreviewResponse | null>(null);
  const [request, setRequest] = useState<SelectScoreSourceRequest | null>(null);
  const [pendingApply, setPendingApply] = useState<SelectScoreSourceRequest | null>(null);

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
    setPendingApply(
      request.requestPublicId
        ? { ...request, expectedReviewVersion: preview.reviewVersion }
        : {
            ...request,
            expectedReviewVersion: preview.reviewVersion,
            requestPublicId: crypto.randomUUID(),
          },
    );
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
      header: "Section / task",
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
        `${displayScore(answer.aiRawScore)} ${answer.aiProviderCategory ?? "No provenance"} ${
          answer.aiProvider ?? ""
        } ${answer.aiAvailable ? "available" : "unavailable"}`,
      cell: (answer) => (
        <>
          {displayScore(answer.aiRawScore)}
          <div className="text-xs text-[var(--ink-muted)]">
            {answer.aiProviderCategory ?? "No provenance"}
            {answer.aiProvider ? ` · ${answer.aiProvider}` : ""}
            {answer.aiAvailable ? " · available" : " · unavailable"}
          </div>
        </>
      ),
    },
    {
      key: "examiner",
      header: "Examiner",
      filterAccessor: (answer) => `${displayScore(answer.examinerScore)} ${answer.examinerStatus}`,
      cell: (answer) => (
        <>
          {displayScore(answer.examinerScore)}
          <div className="text-xs text-[var(--ink-muted)]">{answer.examinerStatus}</div>
        </>
      ),
    },
    {
      key: "selected",
      header: "Selected",
      filterOptions: [
        { label: "All", value: "" },
        { label: "AI", value: "AI" },
        { label: "Examiner", value: "EXAMINER" },
      ],
      filterAccessor: (answer) => answer.selectedScoreSource ?? "",
      cell: (answer) => answer.selectedScoreSource ?? "Not selected",
    },
    {
      key: "assignment",
      header: "Assignment",
      filterAccessor: (answer) => {
        if (!answer.assignedExaminerPublicId) return "Unassigned";
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
              )?.fullName ?? `Assigned (${answer.assignedExaminerPublicId.slice(0, 8)})`)
            : "Unassigned"}
        </span>
      ),
    },
    {
      key: "legacyHost",
      header: "Legacy Host",
      filterAccessor: (answer) => displayScore(answer.teacherScore),
      cell: (answer) => displayScore(answer.teacherScore),
    },
  ];

  const auditColumns: DataTableColumn<ScoreSourceAuditResponse>[] = [
    {
      key: "whenActor",
      header: "When / actor",
      filterAccessor: (audit) => `${audit.occurredAt} ${audit.actorPublicId}`,
      cell: (audit) => (
        <div>
          <div>
            {new Intl.DateTimeFormat("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(audit.occurredAt))}
          </div>
          <div className="text-[var(--ink-muted)]">{audit.actorPublicId.slice(0, 8)}</div>
        </div>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      filterAccessor: (audit) => `${audit.scope} ${audit.scopeValue ?? ""}`,
      cell: (audit) => `${audit.scope}${audit.scopeValue ? ` · ${audit.scopeValue}` : ""}`,
    },
    {
      key: "decision",
      header: "Decision",
      filterAccessor: (audit) => `${audit.selectedSource} ${audit.affectedAnswerCount}`,
      cell: (audit) => `${audit.selectedSource} · ${audit.affectedAnswerCount} answers`,
    },
    {
      key: "previousCounts",
      header: "Previous AI / Examiner / unset",
      filterAccessor: (audit) =>
        `${audit.previousAiCount} ${audit.previousExaminerCount} ${audit.previousUnselectedCount}`,
      cell: (audit) =>
        `${audit.previousAiCount} / ${audit.previousExaminerCount} / ${audit.previousUnselectedCount}`,
    },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
      <div>
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">Score review</h3>
      </div>

      {review.data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="AI-eligible attempts" value={review.data.aiEligibleAttemptCount} />
          <Metric label="Assigned" value={review.data.assignedAttemptCount} />
          <Metric label="Unassigned" value={review.data.unassignedAttemptCount} />
          <Metric label="Examiner answers pending" value={review.data.pendingExaminerAnswerCount} />
          <Metric
            label="Selected score unavailable"
            value={review.data.unavailableSelectedAnswerCount}
          />
        </div>
      )}

      {review.data?.publicationLocked && (
        <Alert tone="warning">Reports have been published. Score-source changes are locked.</Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {applyMutation.isSuccess && (
        <Alert tone="success">
          Applied {applyMutation.data.affectedAnswerCount} score selections; previous
          AI/Examiner/unselected counts: {applyMutation.data.previousAiCount}/
          {applyMutation.data.previousExaminerCount}/{applyMutation.data.previousUnselectedCount}.
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-4 md:items-end">
        <Select
          label="Apply scope"
          value={scope}
          onChange={(event) => {
            setScope(event.target.value as ScoreSourceSelectionScope);
            setPreview(null);
          }}
          options={SCOPE_OPTIONS}
        />
        {scope !== "ALL" && (
          <Select
            label={scope === "SECTION" ? "Section" : "Task section filter"}
            value={section}
            onChange={(event) => {
              setSection(event.target.value);
              setTaskType("");
              setPreview(null);
            }}
            options={sections.map((value) => ({ label: value, value }))}
            placeholder="Select section"
          />
        )}
        {scope === "TASK_TYPE" && (
          <Select
            label="Task type"
            value={taskType}
            onChange={(event) => {
              setTaskType(event.target.value);
              setPreview(null);
            }}
            options={taskTypes.map((value) => ({ label: value, value }))}
            placeholder="Select task type"
          />
        )}
        <Select
          label="Report score source"
          value={source}
          onChange={(event) => {
            setSource(event.target.value as ScoreSource);
            setPreview(null);
          }}
          options={SOURCE_OPTIONS}
        />
        <Button
          type="button"
          onClick={openPreview}
          disabled={!canPreview || review.isLoading || previewMutation.isPending}
        >
          {previewMutation.isPending ? "Checking…" : "Preview selection"}
        </Button>
      </div>

      {preview && (
        <div className="flex flex-col gap-3 rounded-md bg-[var(--surface-subtle)] p-4 text-sm">
          <p>
            {preview.matchedAnswerCount} answers match; {preview.availableAnswerCount} available and{" "}
            {preview.unavailableAnswerCount} unavailable. Current AI/Examiner/unselected:{" "}
            {preview.currentAiCount}/{preview.currentExaminerCount}/{preview.currentUnselectedCount}
            .
          </p>
          {!preview.canApply && (
            <Alert tone="warning">
              Nothing changed. Resolve unavailable scores or refresh the review before applying this
              selection.
            </Alert>
          )}
          <div>
            <Button
              type="button"
              onClick={apply}
              disabled={!preview.canApply || applyMutation.isPending}
            >
              {applyMutation.isPending ? "Applying…" : "Apply selection"}
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={answerColumns}
        rows={answers}
        getRowKey={(answer) => answer.answerPublicId}
        isLoading={review.isLoading}
        emptyTitle="No answer scores are available yet."
      />

      <details className="rounded-md border border-[var(--shell-border)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--ink-primary)]">
          Source selection history {audits.data ? `(${audits.data.length})` : ""}
        </summary>
        {audits.isLoading ? (
          <p className="mt-3 text-sm text-[var(--ink-secondary)]">Loading history…</p>
        ) : null}
        {audits.error ? (
          <Alert className="mt-3" tone="error">
            Unable to load score-source history.
          </Alert>
        ) : null}
        <div className="mt-3">
          <DataTable
            columns={auditColumns}
            rows={audits.data ?? EMPTY_AUDITS}
            getRowKey={(audit) => audit.auditPublicId}
            isLoading={audits.isLoading}
            emptyTitle="No source changes have been recorded for this exam."
          />
        </div>
      </details>
      <ConfirmDialog
        open={pendingApply !== null}
        title="Apply score source?"
        description={`${pendingApply?.selectedSource ?? ""} scores will be applied to ${preview?.matchedAnswerCount ?? 0} matching answers. ${preview?.unavailableAnswerCount ?? 0} unavailable answers will prevent the entire change.`}
        confirmLabel="Apply selection"
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
