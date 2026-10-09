"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import type {
  AssignmentScopeType,
  CreateExaminerAssignmentPreviewRequest,
  ExaminerAssignmentOverviewResponse,
  ExaminerAssignmentMode,
  ExaminerAssignmentScopeRequest,
  UserResponse,
} from "@pte/api-client";
import {
  Alert,
  CollapsibleSection,
  DataTable,
  PaginationControls,
  Select,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
import { useAllTenantClasses, type TenantClassOption } from "@/features/classes/api";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAMINER_ASSIGNMENT_TEXT as T, SESSION_DETAIL_TEXT } from "../constants";
import {
  useActiveExaminers,
  useConfirmExaminerAssignmentPreview,
  useCreateExaminerAssignmentPreview,
  useExaminerAssignmentOverview,
} from "../api";

interface ExaminerAssignmentSectionProps {
  sessionPublicId: string;
}

interface ScopeDraft {
  key: string;
  type: AssignmentScopeType;
  scopePublicId: string;
  examinerPublicId: string;
}

const EMPTY_CLASSES: TenantClassOption[] = [];
const EMPTY_USERS: UserResponse[] = [];
type AssignmentBatch = ExaminerAssignmentOverviewResponse["batches"][number];

function examinerName(examiner: UserResponse): string {
  return examiner.fullName?.trim() || examiner.email || examiner.username;
}

function formatDate(value: string | null, locale: "vi" | "en"): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function scopeLabel(
  type: AssignmentScopeType,
  publicId: string,
  classes: TenantClassOption[],
  labels: { classLabel: string; programLabel: string },
): string {
  if (type === "CLASS") {
    const option = classes.find((item) => item.classPublicId === publicId);
    return option ? `${labels.classLabel} ${option.className}` : `${labels.classLabel} ${publicId}`;
  }
  const option = classes.find((item) => item.programPublicId === publicId);
  return option
    ? `${labels.programLabel} ${option.programName}`
    : `${labels.programLabel} ${publicId}`;
}

export const ExaminerAssignmentSection = ({
  sessionPublicId,
}: ExaminerAssignmentSectionProps): ReactElement => {
  const { locale, t } = useLocale();
  const [mode, setMode] = useState<ExaminerAssignmentMode>("RANDOM");
  const [scopes, setScopes] = useState<ScopeDraft[]>([]);
  const [selectedExaminerIds, setSelectedExaminerIds] = useState<string[]>([]);
  const [batchPage, setBatchPage] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const classesQuery = useAllTenantClasses();
  const classes = classesQuery.data ?? EMPTY_CLASSES;
  const examinersQuery = useActiveExaminers();
  const examiners = examinersQuery.data ?? EMPTY_USERS;
  const overview = useExaminerAssignmentOverview(sessionPublicId, batchPage);
  const createPreview = useCreateExaminerAssignmentPreview(sessionPublicId);
  const confirmPreview = useConfirmExaminerAssignmentPreview(sessionPublicId);
  const classesLoading = classesQuery.isLoading;
  const examinersLoading = examinersQuery.isLoading;

  const text = {
    mode: t("tenant.examinerAssignment.mode", T.MODE_LABEL),
    randomMode: t("tenant.examinerAssignment.randomMode", T.RANDOM_MODE),
    manualMode: t("tenant.examinerAssignment.manualMode", T.MANUAL_MODE),
    scope: t("tenant.examinerAssignment.scope", T.SCOPE_LABEL),
    classLabel: t("tenant.examinerAssignment.class", T.SCOPE_TYPE_CLASS),
    programLabel: t("tenant.examinerAssignment.program", T.SCOPE_TYPE_PROGRAM),
    scopePlaceholder: t("tenant.examinerAssignment.scopePlaceholder", T.SCOPE_PLACEHOLDER),
    addScope: t("tenant.examinerAssignment.addScope", T.ADD_SCOPE),
    remove: t("tenant.examinerAssignment.remove", T.REMOVE_SCOPE),
    examiners: t("tenant.examinerAssignment.examiners", T.EXAMINERS_LABEL),
    examiner: t("tenant.examinerAssignment.examiner", T.EXAMINER_LABEL),
    examinerPlaceholder: t("tenant.examinerAssignment.examinerPlaceholder", T.EXAMINER_PLACEHOLDER),
    noExaminers: t("tenant.examinerAssignment.noExaminers", T.NO_EXAMINERS),
    noActiveScopes: t("tenant.examinerAssignment.noActiveScopes", T.NO_ACTIVE_SCOPES),
    noScopes: t("tenant.examinerAssignment.noScopes", T.NO_SCOPES),
    loading: t("tenant.examinerAssignment.loading", "Loading..."),
    preview: t("tenant.examinerAssignment.preview", T.PREVIEW),
    previewing: t("tenant.examinerAssignment.previewing", T.PREVIEWING),
    previewValid: t("tenant.examinerAssignment.previewValid", T.PREVIEW_VALID),
    previewInvalid: t("tenant.examinerAssignment.previewInvalid", T.PREVIEW_INVALID),
    conflicts: t("tenant.examinerAssignment.conflicts", T.CONFLICTS),
    attempt: t("tenant.examinerAssignment.attempt", T.ATTEMPT),
    conflictingScopes: t("tenant.examinerAssignment.conflictingScopes", T.CONFLICTING_SCOPES),
    attempts: t("tenant.examinerAssignment.attempts", T.ATTEMPT_COUNT),
    eligibleAnswers: t("tenant.examinerAssignment.eligibleAnswers", T.ANSWER_COUNT),
    loads: t("tenant.examinerAssignment.loads", T.LOADS),
    confirm: t("tenant.examinerAssignment.confirm", T.CONFIRM),
    confirming: t("tenant.examinerAssignment.confirming", T.CONFIRMING),
    confirmed: t("tenant.examinerAssignment.confirmed", T.CONFIRMED),
    expired: t("tenant.examinerAssignment.expired", T.EXPIRED),
    stale: t("tenant.examinerAssignment.stale", T.STALE),
    retry: t("tenant.examinerAssignment.retry", T.RETRY),
    batches: t("tenant.examinerAssignment.batches", T.BATCHES),
    noBatches: t("tenant.examinerAssignment.noBatches", T.NO_BATCHES),
    assignedTotal: (count: number) =>
      t("tenant.examinerAssignment.assignedTotal", T.ASSIGNED_TOTAL(count), { count }),
    created: t("tenant.examinerAssignment.created", T.CREATED),
    status: t("tenant.examinerAssignment.status", T.STATUS),
    actions: t("tenant.examinerAssignment.actions", T.ACTIONS),
    dateRange: t("tenant.examinerAssignment.dateRange", "Date range"),
    allStatuses: t("tenant.examinerAssignment.allStatuses", "All statuses"),
    previewedStatus: t("tenant.examinerAssignment.previewed", "Previewed"),
    committedStatus: t("tenant.examinerAssignment.committed", "Committed"),
    expiredStatus: t("tenant.examinerAssignment.expiredStatus", "Expired"),
    staleStatus: t("tenant.examinerAssignment.staleStatus", "Stale"),
    invalidStatus: t("tenant.examinerAssignment.invalid", "Invalid"),
  };
  const scopeTypes: { value: AssignmentScopeType; label: string }[] = [
    { value: "CLASS", label: text.classLabel },
    { value: "PROGRAM", label: text.programLabel },
  ];
  const batchStatusFilterOptions = [
    { value: "", label: text.allStatuses },
    { value: "PREVIEWED", label: text.previewedStatus },
    { value: "COMMITTED", label: text.committedStatus },
    { value: "EXPIRED", label: text.expiredStatus },
    { value: "STALE", label: text.staleStatus },
    { value: "INVALID", label: text.invalidStatus },
  ] as const;
  const batchStatusLabels: Record<string, string> = {
    PREVIEWED: text.previewedStatus,
    COMMITTED: text.committedStatus,
    EXPIRED: text.expiredStatus,
    STALE: text.staleStatus,
    INVALID: text.invalidStatus,
  };

  const resetAssignmentFeedback = (): void => {
    createPreview.reset();
    confirmPreview.reset();
  };

  const activeClasses = useMemo(
    () => classes.filter((item) => item.status === "ACTIVE"),
    [classes],
  );
  const programs = useMemo(() => {
    const unique = new Map<string, { publicId: string; name: string }>();
    activeClasses.forEach((item) => {
      unique.set(item.programPublicId, { publicId: item.programPublicId, name: item.programName });
    });
    return [...unique.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [activeClasses]);

  const updateScope = (key: string, patch: Partial<ScopeDraft>): void => {
    resetAssignmentFeedback();
    setScopes((previous) =>
      previous.map((scope) =>
        scope.key === key
          ? { ...scope, ...patch, ...(patch.type ? { scopePublicId: "" } : {}) }
          : scope,
      ),
    );
  };

  const canPreview =
    scopes.length > 0 &&
    !classesQuery.isLoading &&
    !classesQuery.isError &&
    !examinersQuery.isLoading &&
    !examinersQuery.isError &&
    scopes.every(
      (scope) =>
        scope.scopePublicId.length > 0 && (mode === "RANDOM" || scope.examinerPublicId.length > 0),
    ) &&
    (mode !== "RANDOM" || selectedExaminerIds.length > 0) &&
    !createPreview.isPending;

  const createRequest = (): CreateExaminerAssignmentPreviewRequest => {
    const scopeRequests: ExaminerAssignmentScopeRequest[] = scopes.map((scope) => ({
      type: scope.type,
      scopePublicId: scope.scopePublicId,
      examinerPublicId: mode === "MANUAL" ? scope.examinerPublicId : null,
    }));
    return {
      mode,
      scopes: scopeRequests,
      examinerPublicIds: mode === "RANDOM" ? selectedExaminerIds : [],
    };
  };

  const toggleExaminer = (publicId: string): void => {
    resetAssignmentFeedback();
    setSelectedExaminerIds((previous) =>
      previous.includes(publicId)
        ? previous.filter((id) => id !== publicId)
        : [...previous, publicId],
    );
  };

  const previewError = errorMessage(createPreview.error);
  const confirmError = errorMessage(confirmPreview.error);
  const overviewError = errorMessage(overview.error);
  const classesError = errorMessage(classesQuery.error);
  const examinersError = errorMessage(examinersQuery.error);
  const preview = createPreview.data;
  const previewExpiryTimestamps = [
    ...(overview.data?.batches ?? [])
      .filter((batch) => batch.status === "PREVIEWED")
      .map((batch) => Date.parse(batch.previewExpiresAt)),
    ...(preview?.status === "PREVIEWED" && preview.previewExpiresAt
      ? [Date.parse(preview.previewExpiresAt)]
      : []),
  ]
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  const nextPreviewExpiry = previewExpiryTimestamps.find((expiresAt) => expiresAt > currentTime);

  useEffect(() => {
    if (nextPreviewExpiry === undefined) return;
    const timeoutId = window.setTimeout(
      () => setCurrentTime(Date.now()),
      Math.max(0, nextPreviewExpiry - Date.now()),
    );
    return () => window.clearTimeout(timeoutId);
  }, [nextPreviewExpiry]);

  const assignedAttemptCount = overview.data?.assignedAttemptCount ?? 0;
  const confirmationMatchesPreview =
    preview?.batchPublicId != null && confirmPreview.data?.batchPublicId === preview.batchPublicId;
  const currentPreviewCommitted =
    confirmationMatchesPreview && confirmPreview.data?.status === "COMMITTED";
  const currentPreviewExpired =
    (confirmationMatchesPreview && confirmPreview.data?.status === "EXPIRED") ||
    (preview?.status === "PREVIEWED" &&
      preview.previewExpiresAt !== null &&
      Date.parse(preview.previewExpiresAt) <= currentTime);
  const currentPreviewStale = confirmationMatchesPreview && confirmPreview.data?.status === "STALE";

  const batchColumns: DataTableColumn<AssignmentBatch>[] = [
    {
      key: "status",
      header: text.status,
      filterOptions: batchStatusFilterOptions,
      filterAccessor: (batch) =>
        batch.status === "PREVIEWED" && Date.parse(batch.previewExpiresAt) <= currentTime
          ? "EXPIRED"
          : batch.status,
      cell: (batch) =>
        batchStatusLabels[
          batch.status === "PREVIEWED" && Date.parse(batch.previewExpiresAt) <= currentTime
            ? "EXPIRED"
            : batch.status
        ] ?? batch.status,
    },
    {
      key: "mode",
      header: text.mode,
      filterAccessor: (batch) => (batch.mode === "RANDOM" ? text.randomMode : text.manualMode),
      cell: (batch) => (batch.mode === "RANDOM" ? text.randomMode : text.manualMode),
    },
    {
      key: "attemptCount",
      header: text.attempts,
      filterAccessor: (batch) => batch.attemptCount,
      cell: (batch) => batch.attemptCount,
    },
    {
      key: "answerCount",
      header: text.eligibleAnswers,
      filterAccessor: (batch) => batch.eligibleAnswerCount,
      cell: (batch) => batch.eligibleAnswerCount,
    },
    {
      key: "created",
      header: text.created,
      filterType: "date-range",
      filterAccessor: (batch) => batch.createdAt,
      filterPlaceholder: text.dateRange,
      cell: (batch) => formatDate(batch.createdAt, locale),
    },
  ];

  return (
    <CollapsibleSection
      title={t("tenant.examinerAssignment.title", SESSION_DETAIL_TEXT.EXAMINER_ASSIGNMENTS_SECTION)}
      className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
      contentClassName="flex flex-col gap-5"
    >
      {classesQuery.isError && <Alert tone="error">{classesError}</Alert>}
      {examinersQuery.isError && <Alert tone="error">{examinersError}</Alert>}
      {overviewError && <Alert tone="error">{overviewError}</Alert>}
      {previewError && <Alert tone="error">{previewError}</Alert>}
      {confirmError && <Alert tone="error">{confirmError}</Alert>}

      <div className="flex flex-col gap-4">
        <div className="max-w-md">
          <Select
            id="examiner-assignment-mode"
            label={text.mode}
            value={mode}
            onChange={(event) => {
              resetAssignmentFeedback();
              setMode(event.target.value as ExaminerAssignmentMode);
            }}
            options={[
              { value: "RANDOM", label: text.randomMode },
              { value: "MANUAL", label: text.manualMode },
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-[var(--ink-primary)]">{text.scope}</h4>
            <button
              type="button"
              onClick={() => {
                resetAssignmentFeedback();
                setScopes((previous) => [
                  ...previous,
                  {
                    key: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${previous.length}`,
                    type: "CLASS",
                    scopePublicId: "",
                    examinerPublicId: "",
                  },
                ]);
              }}
              className="rounded-lg border border-[var(--shell-border)] px-3 py-1.5 text-sm text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]"
            >
              + {text.addScope}
            </button>
          </div>

          {scopes.length === 0 && (
            <p className="text-sm text-[var(--ink-secondary)]">{text.noScopes}</p>
          )}
          {scopes.length === 0 &&
            !classesLoading &&
            !classesQuery.isError &&
            activeClasses.length === 0 && (
              <p className="text-sm text-[var(--ink-secondary)]">{text.noActiveScopes}</p>
            )}
          {scopes.map((scope) => {
            const selectedKeys = new Set(
              scopes
                .filter((item) => item.key !== scope.key)
                .map((item) => `${item.type}:${item.scopePublicId}`),
            );
            const options =
              scope.type === "CLASS"
                ? activeClasses.map((item) => ({
                    publicId: item.classPublicId,
                    label: `${item.className} — ${item.programName}`,
                  }))
                : programs.map((item) => ({ publicId: item.publicId, label: item.name }));
            return (
              <div
                key={scope.key}
                className="grid gap-3 rounded-md border border-[var(--shell-border)] p-3 md:grid-cols-[150px_1fr_1fr_auto]"
              >
                <Select
                  id={`scope-type-${scope.key}`}
                  label={`${text.classLabel} / ${text.programLabel}`}
                  value={scope.type}
                  onChange={(event) =>
                    updateScope(scope.key, {
                      type: event.target.value as AssignmentScopeType,
                    })
                  }
                  options={scopeTypes}
                />
                <Select
                  id={`scope-value-${scope.key}`}
                  label={text.scope}
                  value={scope.scopePublicId}
                  onChange={(event) =>
                    updateScope(scope.key, { scopePublicId: event.target.value })
                  }
                  disabled={classesLoading || classesQuery.isError}
                  placeholder={classesLoading ? text.loading : text.scopePlaceholder}
                  options={options
                    .filter(
                      (option) =>
                        !selectedKeys.has(`${scope.type}:${option.publicId}`) ||
                        option.publicId === scope.scopePublicId,
                    )
                    .map((option) => ({ value: option.publicId, label: option.label }))}
                />
                {mode === "MANUAL" ? (
                  <Select
                    id={`scope-examiner-${scope.key}`}
                    label={text.examiner}
                    value={scope.examinerPublicId}
                    onChange={(event) =>
                      updateScope(scope.key, { examinerPublicId: event.target.value })
                    }
                    disabled={examinersLoading || examinersQuery.isError || examiners.length === 0}
                    placeholder={text.examinerPlaceholder}
                    options={examiners.map((examiner) => ({
                      value: examiner.publicId,
                      label: examinerName(examiner),
                    }))}
                  />
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetAssignmentFeedback();
                    setScopes((previous) => previous.filter((item) => item.key !== scope.key));
                  }}
                  className="self-end rounded-md px-2 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  {text.remove}
                </button>
              </div>
            );
          })}
        </div>

        {mode === "RANDOM" && (
          <fieldset className="flex flex-col gap-2 rounded-md border border-[var(--shell-border)] p-3">
            <legend className="px-1 text-sm font-semibold text-[var(--ink-primary)]">
              {text.examiners}
            </legend>
            {examinersLoading ? (
              <p className="text-sm text-[var(--ink-secondary)]">{text.loading}</p>
            ) : examinersQuery.isError ? (
              <p className="text-sm text-red-700">{examinersError}</p>
            ) : examiners.length === 0 ? (
              <p className="text-sm text-[var(--ink-secondary)]">{text.noExaminers}</p>
            ) : (
              examiners.map((examiner) => (
                <label
                  key={examiner.publicId}
                  className="flex items-center gap-2 text-sm text-[var(--ink-primary)]"
                >
                  <input
                    type="checkbox"
                    checked={selectedExaminerIds.includes(examiner.publicId)}
                    onChange={() => toggleExaminer(examiner.publicId)}
                  />
                  {examinerName(examiner)}
                </label>
              ))
            )}
          </fieldset>
        )}

        <button
          type="button"
          disabled={!canPreview}
          onClick={() => {
            resetAssignmentFeedback();
            setBatchPage(0);
            createPreview.mutate(createRequest());
          }}
          className="self-start rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createPreview.isPending ? text.previewing : text.preview}
        </button>
      </div>

      {preview && (
        <div className="flex flex-col gap-3 rounded-md border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4">
          <Alert
            tone={
              preview.valid && !currentPreviewExpired && !currentPreviewStale
                ? "success"
                : "warning"
            }
          >
            {currentPreviewCommitted ? (
              <>
                {text.confirmed} <code>{preview.batchPublicId}</code>
              </>
            ) : currentPreviewExpired ? (
              <>
                {text.expired} <code>{preview.batchPublicId}</code>
              </>
            ) : currentPreviewStale ? (
              <>
                {text.stale} <code>{preview.batchPublicId}</code>
              </>
            ) : preview.valid ? (
              text.previewValid
            ) : (
              text.previewInvalid
            )}
          </Alert>
          <p className="text-sm text-[var(--ink-primary)]">
            {text.attempts}: <strong>{preview.attemptCount}</strong>
            <span className="px-2">·</span>
            {text.eligibleAnswers}: <strong>{preview.eligibleAnswerCount}</strong>
          </p>
          <LoadTable loads={preview.examinerLoads} examiners={examiners} labels={text} />
          {preview.conflicts.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-red-800">{text.conflicts}</h4>
              {preview.conflicts.map((conflict) => (
                <div
                  key={conflict.attemptPublicId}
                  className="rounded border border-[var(--blush-action)] bg-[var(--surface-card)] p-2 text-sm text-[var(--ink-primary)]"
                >
                  <p>
                    {text.attempt}: <code>{conflict.attemptPublicId}</code>
                  </p>
                  <p>
                    {text.conflictingScopes}:{" "}
                    {conflict.conflictingScopes
                      .map((scope) =>
                        scopeLabel(scope.type, scope.scopePublicId, classes, {
                          classLabel: text.classLabel,
                          programLabel: text.programLabel,
                        }),
                      )
                      .join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
          {preview.batchPublicId &&
            preview.valid &&
            preview.status === "PREVIEWED" &&
            !currentPreviewCommitted &&
            !currentPreviewExpired &&
            !currentPreviewStale && (
              <button
                type="button"
                disabled={confirmPreview.isPending}
                onClick={() => confirmPreview.mutate(preview.batchPublicId as string)}
                className="self-start rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:opacity-50"
              >
                {confirmPreview.isPending ? text.confirming : text.confirm}
              </button>
            )}
        </div>
      )}

      {confirmPreview.data?.status === "COMMITTED" && !confirmationMatchesPreview && (
        <Alert tone="success">
          {text.confirmed} <code>{confirmPreview.data.batchPublicId}</code>
        </Alert>
      )}
      {confirmPreview.data?.status === "EXPIRED" && !confirmationMatchesPreview && (
        <Alert tone="warning">
          {text.expired} <code>{confirmPreview.data.batchPublicId}</code>
        </Alert>
      )}
      {confirmPreview.data?.status === "STALE" && !confirmationMatchesPreview && (
        <Alert tone="warning">
          {text.stale} <code>{confirmPreview.data.batchPublicId}</code>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-[var(--ink-primary)]">{text.batches}</h4>
          <span className="text-sm text-[var(--ink-secondary)]">
            {text.assignedTotal(assignedAttemptCount)}
          </span>
        </div>
        {overview.isError ? (
          <button
            type="button"
            onClick={() => void overview.refetch()}
            className="self-start rounded-lg border border-[var(--shell-border)] px-3 py-1.5 text-sm text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]"
          >
            {text.retry}
          </button>
        ) : (
          <DataTable
            columns={batchColumns}
            rows={overview.data?.batches ?? []}
            getRowKey={(batch) => batch.batchPublicId}
            isLoading={overview.isLoading}
            emptyTitle={text.noBatches}
            rowActionsHeader={text.actions}
            clientSidePagination={false}
            rowActions={(batch) =>
              batch.status === "PREVIEWED" &&
              Date.parse(batch.previewExpiresAt) > currentTime &&
              confirmPreview.data?.batchPublicId !== batch.batchPublicId ? (
                <button
                  type="button"
                  disabled={confirmPreview.isPending}
                  onClick={() => confirmPreview.mutate(batch.batchPublicId)}
                  className="text-action hover:underline disabled:opacity-50"
                >
                  {text.confirm}
                </button>
              ) : null
            }
            pagination={
              overview.data ? (
                <PaginationControls
                  meta={{
                    page: overview.data.page,
                    size: overview.data.size,
                    totalElements: overview.data.totalBatches,
                    totalPages: overview.data.totalPages,
                  }}
                  onPageChange={setBatchPage}
                  disabled={overview.isFetching}
                />
              ) : undefined
            }
          />
        )}
      </div>
      <LoadTable
        loads={overview.isError ? [] : (overview.data?.committedExaminerLoads ?? [])}
        examiners={examiners}
        labels={text}
      />
    </CollapsibleSection>
  );
};

interface LoadTableProps {
  loads: { examinerPublicId: string; attemptCount: number; eligibleAnswerCount: number }[];
  examiners: UserResponse[];
  labels: {
    examiner: string;
    attempts: string;
    eligibleAnswers: string;
    loads: string;
    noBatches: string;
  };
}

function LoadTable({ loads, examiners, labels }: LoadTableProps): ReactElement | null {
  if (loads.length === 0) return null;
  const byId = new Map(examiners.map((examiner) => [examiner.publicId, examiner]));
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-[var(--ink-primary)]">{labels.loads}</h4>
      <DataTable
        columns={
          [
            {
              key: "examiner",
              header: labels.examiner,
              filterAccessor: (load) => {
                const examiner = byId.get(load.examinerPublicId);
                return examiner
                  ? `${examinerName(examiner)} ${examiner.email}`
                  : load.examinerPublicId;
              },
              cell: (load) =>
                byId.get(load.examinerPublicId)
                  ? examinerName(byId.get(load.examinerPublicId) as UserResponse)
                  : load.examinerPublicId,
            },
            {
              key: "attemptCount",
              header: labels.attempts,
              filterAccessor: (load) => load.attemptCount,
              cell: (load) => load.attemptCount,
            },
            {
              key: "answerCount",
              header: labels.eligibleAnswers,
              filterAccessor: (load) => load.eligibleAnswerCount,
              cell: (load) => load.eligibleAnswerCount,
            },
          ] satisfies DataTableColumn<LoadTableProps["loads"][number]>[]
        }
        rows={loads}
        getRowKey={(load) => load.examinerPublicId}
        emptyTitle={labels.noBatches}
      />
    </div>
  );
}
