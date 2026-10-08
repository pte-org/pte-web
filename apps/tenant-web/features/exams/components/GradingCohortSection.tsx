"use client";

import { useMemo, useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage, type GradingMarkingMode } from "@pte/api-client";
import { Alert, Badge, Button, ConfirmDialog, Select } from "@pte/ui";
import { useFinalizeGradingCohort, useGradingCohortPreview } from "../api/gradingCohort";

interface GradingCohortSectionProps {
  sessionPublicId: string;
  sessionStatus: string;
}

export function GradingCohortSection({
  sessionPublicId,
  sessionStatus,
}: GradingCohortSectionProps): ReactElement | null {
  const preview = useGradingCohortPreview(sessionPublicId, sessionStatus === "CLOSED");
  const finalize = useFinalizeGradingCohort(sessionPublicId);
  const [selectedMarkingMode, setSelectedMarkingMode] = useState<GradingMarkingMode | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const markingMode = selectedMarkingMode ?? preview.data?.markingMode ?? "AI_ONLY";

  const outstanding = useMemo(
    () =>
      preview.data?.attempts.filter(
        (attempt) => !attempt.excluded && attempt.status !== "SUBMITTED",
      ) ?? [],
    [preview.data?.attempts],
  );
  const missingReasons = outstanding.filter(
    (attempt) => !(reasons[attempt.attemptPublicId] ?? "").trim(),
  );
  const dispositionPayload = useMemo(
    () =>
      outstanding
        .map((attempt) => ({
          attemptPublicId: attempt.attemptPublicId,
          reason: (reasons[attempt.attemptPublicId] ?? "").trim(),
        }))
        .filter((item) => item.reason.length > 0),
    [outstanding, reasons],
  );
  const blocked =
    Boolean(preview.data?.blockingReasons.length) ||
    missingReasons.length > 0 ||
    !preview.data?.previewVersion;

  if (sessionStatus !== "CLOSED") return null;

  const finalizeCohort = (): void => {
    if (!preview.data?.previewVersion || blocked) return;
    finalize.mutate(
      {
        expectedPreviewVersion: preview.data.previewVersion,
        markingMode,
        outstandingDispositions: dispositionPayload,
      },
      { onSuccess: () => setConfirmOpen(false) },
    );
  };

  return (
    <section className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink-primary)]">Grading cohort</h2>
        </div>
        {preview.data?.finalized && <Badge variant="success">Finalized</Badge>}
      </div>
      {preview.isLoading && (
        <p className="mt-4 text-sm text-[var(--ink-secondary)]">Loading grading coverage…</p>
      )}
      {preview.error && (
        <Alert tone="error" className="mt-4">
          {getUserFacingApiErrorMessage(preview.error)}
          <Button size="sm" variant="ghost" onClick={() => void preview.refetch()}>
            Retry
          </Button>
        </Alert>
      )}
      {preview.data && !preview.data.finalized && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-[var(--surface-subtle)] p-3">
              <p className="text-xs text-[var(--ink-secondary)]">Submitted included</p>
              <p className="mt-1 text-lg font-semibold text-[var(--ink-primary)]">
                {preview.data.submittedAttemptCount}
              </p>
            </div>
            <div className="rounded-md bg-[var(--surface-subtle)] p-3">
              <p className="text-xs text-[var(--ink-secondary)]">Outstanding</p>
              <p className="mt-1 text-lg font-semibold text-[var(--ink-primary)]">
                {preview.data.outstandingAttemptCount}
              </p>
            </div>
            <Select
              id="grading-marking-mode"
              label="Subjective marking mode"
              options={[
                { label: "AI only", value: "AI_ONLY" },
                { label: "Manual examiner", value: "MANUAL_EXAMINER" },
              ]}
              value={markingMode}
              onChange={(event) => setSelectedMarkingMode(event.target.value as GradingMarkingMode)}
            />
          </div>
          {preview.data.blockingReasons.length > 0 && (
            <Alert tone="warning" className="mt-4" title="Cannot finalize yet">
              <ul className="list-disc pl-5">
                {preview.data.blockingReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </Alert>
          )}
          {outstanding.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                Every outstanding attempt needs a reasoned cohort-only disposition.
              </p>
              <div className="mt-3 space-y-3">
                {outstanding.map((attempt) => (
                  <label key={attempt.attemptPublicId} className="block text-sm text-amber-900">
                    Attempt <code className="font-mono text-xs">{attempt.attemptPublicId}</code>
                    <input
                      value={reasons[attempt.attemptPublicId] ?? ""}
                      onChange={(event) =>
                        setReasons((current) => ({
                          ...current,
                          [attempt.attemptPublicId]: event.target.value,
                        }))
                      }
                      placeholder="Reason, for example: absent"
                      className="mt-1 block w-full rounded-md border border-amber-300 bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)] outline-none focus:ring-2 focus:ring-action"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
          {missingReasons.length > 0 && (
            <p className="mt-3 text-sm text-amber-700">
              {missingReasons.length} outstanding attempt(s) still need a reason.
            </p>
          )}
          <div className="mt-5 flex justify-end">
            <Button
              disabled={blocked || finalize.isPending}
              isLoading={finalize.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              Preview and finalize cohort
            </Button>
          </div>
        </>
      )}
      {finalize.error && (
        <Alert tone="error" className="mt-4">
          {getUserFacingApiErrorMessage(finalize.error)}
          <Button size="sm" variant="ghost" onClick={() => void preview.refetch()}>
            Reload preview
          </Button>
        </Alert>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Finalize grading cohort?"
        description="This freezes the submitted-attempt inventory for this closed session. Outstanding attempts will be retained with the reasons entered above; no attempt is force-submitted."
        confirmLabel="Finalize cohort"
        tone="primary"
        isConfirming={finalize.isPending}
        onConfirm={finalizeCohort}
        onClose={() => setConfirmOpen(false)}
      />
    </section>
  );
}
