"use client";

import { useMemo, useState, type ReactElement } from "react";
import type {
  HostScoreReviewResponse,
  ScoreSource,
  ScoreSourceSelectionPreviewResponse,
  ScoreSourceSelectionScope,
  SelectScoreSourceRequest,
} from "@pte/api-client";
import { Alert, Button, Select } from "@pte/ui";
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
    const confirmed = window.confirm(
      `Apply ${nextRequest.selectedSource} to ${preview.matchedAnswerCount} matching answers? ` +
        `${preview.unavailableAnswerCount} unavailable answers will prevent the entire change.`,
    );
    if (!confirmed) return;
    setRequest(nextRequest);
    applyMutation.mutate(nextRequest, {
      onSuccess: () => {
        setPreview(null);
        setRequest(null);
      },
    });
  };

  const error = errorMessage(review.error ?? previewMutation.error ?? applyMutation.error);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Score review</h3>
        <p className="mt-1 text-sm text-gray-600">
          Compare AI and Examiner scores. Host selection changes the score source used for the final
          report; the legacy Host score remains separate.
        </p>
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
        <div className="flex flex-col gap-3 rounded-md bg-gray-50 p-4 text-sm">
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

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-2">Section / task</th>
              <th className="px-3 py-2">AI</th>
              <th className="px-3 py-2">Examiner</th>
              <th className="px-3 py-2">Selected</th>
              <th className="px-3 py-2">Assignment</th>
              <th className="px-3 py-2">Legacy Host</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {answers.map((answer) => (
              <tr key={answer.answerPublicId}>
                <td className="px-3 py-2">
                  <div className="font-medium">{answer.section ?? "—"}</div>
                  <div className="text-gray-500">{answer.taskType}</div>
                </td>
                <td className="px-3 py-2">
                  {displayScore(answer.aiRawScore)}
                  <div className="text-xs text-gray-500">
                    {answer.aiProviderCategory ?? "No provenance"}
                    {answer.aiProvider ? ` · ${answer.aiProvider}` : ""}
                    {answer.aiAvailable ? " · available" : " · unavailable"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {displayScore(answer.examinerScore)}
                  <div className="text-xs text-gray-500">{answer.examinerStatus}</div>
                </td>
                <td className="px-3 py-2">{answer.selectedScoreSource ?? "Not selected"}</td>
                <td className="px-3 py-2" title={answer.assignedExaminerPublicId ?? undefined}>
                  {answer.assignedExaminerPublicId
                    ? (examinerDirectory.data?.find(
                        (examiner) => examiner.publicId === answer.assignedExaminerPublicId,
                      )?.fullName ?? `Assigned (${answer.assignedExaminerPublicId.slice(0, 8)})`)
                    : "Unassigned"}
                </td>
                <td className="px-3 py-2">{displayScore(answer.teacherScore)}</td>
              </tr>
            ))}
            {answers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  No answer scores are available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details className="rounded-md border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-800">
          Source selection history {audits.data ? `(${audits.data.length})` : ""}
        </summary>
        {audits.isLoading ? <p className="mt-3 text-sm text-gray-500">Loading history…</p> : null}
        {audits.error ? (
          <Alert className="mt-3" tone="error">
            Unable to load score-source history.
          </Alert>
        ) : null}
        {!audits.isLoading && !audits.error && audits.data?.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 uppercase text-gray-600">
                <tr>
                  <th className="px-3 py-2">When / actor</th>
                  <th className="px-3 py-2">Scope</th>
                  <th className="px-3 py-2">Decision</th>
                  <th className="px-3 py-2">Previous AI / Examiner / unset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {audits.data.map((audit) => (
                  <tr key={audit.auditPublicId}>
                    <td className="px-3 py-2">
                      <div>
                        {new Intl.DateTimeFormat("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(audit.occurredAt))}
                      </div>
                      <div className="text-gray-500">{audit.actorPublicId.slice(0, 8)}</div>
                    </td>
                    <td className="px-3 py-2">
                      {audit.scope}
                      {audit.scopeValue ? ` · ${audit.scopeValue}` : ""}
                    </td>
                    <td className="px-3 py-2">
                      {audit.selectedSource} · {audit.affectedAnswerCount} answers
                    </td>
                    <td className="px-3 py-2">
                      {audit.previousAiCount} / {audit.previousExaminerCount} /{" "}
                      {audit.previousUnselectedCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!audits.isLoading && !audits.error && audits.data?.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No source changes have been recorded for this exam.
          </p>
        ) : null}
      </details>
    </div>
  );
};

function Metric({ label, value }: { label: string; value: number }): ReactElement {
  return (
    <div className="rounded-md bg-gray-50 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}
