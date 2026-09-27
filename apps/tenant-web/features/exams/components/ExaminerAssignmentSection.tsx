"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import type {
  AssignmentScopeType,
  CreateExaminerAssignmentPreviewRequest,
  ExaminerAssignmentMode,
  ExaminerAssignmentScopeRequest,
  UserResponse,
} from "@pte/api-client";
import { Alert, CollapsibleSection, Select } from "@pte/ui";
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

const SCOPE_TYPES: { value: AssignmentScopeType; label: string }[] = [
  { value: "CLASS", label: T.SCOPE_TYPE_CLASS },
  { value: "PROGRAM", label: T.SCOPE_TYPE_PROGRAM },
];
const EMPTY_CLASSES: TenantClassOption[] = [];
const EMPTY_USERS: UserResponse[] = [];

function examinerName(examiner: UserResponse): string {
  return examiner.fullName?.trim() || examiner.email || examiner.username;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function scopeLabel(
  type: AssignmentScopeType,
  publicId: string,
  classes: TenantClassOption[],
): string {
  if (type === "CLASS") {
    const option = classes.find((item) => item.classPublicId === publicId);
    return option
      ? `${T.SCOPE_TYPE_CLASS} ${option.className}`
      : `${T.SCOPE_TYPE_CLASS} ${publicId}`;
  }
  const option = classes.find((item) => item.programPublicId === publicId);
  return option
    ? `${T.SCOPE_TYPE_PROGRAM} ${option.programName}`
    : `${T.SCOPE_TYPE_PROGRAM} ${publicId}`;
}

export const ExaminerAssignmentSection = ({
  sessionPublicId,
}: ExaminerAssignmentSectionProps): ReactElement => {
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
  const overviewTotalPages = overview.data?.totalPages ?? 0;
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

  return (
    <CollapsibleSection
      title={SESSION_DETAIL_TEXT.EXAMINER_ASSIGNMENTS_SECTION}
      className="rounded-lg border border-gray-200 bg-white p-5"
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
            label={T.MODE_LABEL}
            value={mode}
            onChange={(event) => {
              resetAssignmentFeedback();
              setMode(event.target.value as ExaminerAssignmentMode);
            }}
            options={[
              { value: "RANDOM", label: T.RANDOM_MODE },
              { value: "MANUAL", label: T.MANUAL_MODE },
            ]}
          />
        </div>

        {mode === "RANDOM" && (
          <p className="text-sm text-gray-600">
            {assignedAttemptCount > 0 ? T.SUPPLEMENTAL_HELP : T.RANDOM_HELP}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-gray-800">{T.SCOPE_LABEL}</h4>
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
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              + {T.ADD_SCOPE}
            </button>
          </div>

          {scopes.length === 0 && <p className="text-sm text-gray-500">{T.NO_SCOPES}</p>}
          {scopes.length === 0 &&
            !classesLoading &&
            !classesQuery.isError &&
            activeClasses.length === 0 && (
              <p className="text-sm text-gray-500">{T.NO_ACTIVE_SCOPES}</p>
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
                className="grid gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-[150px_1fr_1fr_auto]"
              >
                <Select
                  id={`scope-type-${scope.key}`}
                  label={`${T.SCOPE_TYPE_CLASS} / ${T.SCOPE_TYPE_PROGRAM}`}
                  value={scope.type}
                  onChange={(event) =>
                    updateScope(scope.key, {
                      type: event.target.value as AssignmentScopeType,
                    })
                  }
                  options={SCOPE_TYPES}
                />
                <Select
                  id={`scope-value-${scope.key}`}
                  label={T.SCOPE_LABEL}
                  value={scope.scopePublicId}
                  onChange={(event) => updateScope(scope.key, { scopePublicId: event.target.value })}
                  disabled={classesLoading || classesQuery.isError}
                  placeholder={classesLoading ? "Loading..." : T.SCOPE_PLACEHOLDER}
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
                    label={T.EXAMINER_LABEL}
                    value={scope.examinerPublicId}
                    onChange={(event) =>
                      updateScope(scope.key, { examinerPublicId: event.target.value })
                    }
                    disabled={examinersLoading || examinersQuery.isError || examiners.length === 0}
                    placeholder={T.EXAMINER_PLACEHOLDER}
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
                  {T.REMOVE_SCOPE}
                </button>
              </div>
            );
          })}
        </div>

        {mode === "RANDOM" && (
          <fieldset className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
            <legend className="px-1 text-sm font-semibold text-gray-800">
              {T.EXAMINERS_LABEL}
            </legend>
            {examinersLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : examinersQuery.isError ? (
              <p className="text-sm text-red-700">{examinersError}</p>
            ) : examiners.length === 0 ? (
              <p className="text-sm text-gray-500">{T.NO_EXAMINERS}</p>
            ) : (
              examiners.map((examiner) => (
                <label
                  key={examiner.publicId}
                  className="flex items-center gap-2 text-sm text-gray-700"
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
          {createPreview.isPending ? T.PREVIEWING : T.PREVIEW}
        </button>
      </div>

      {preview && (
        <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          <Alert
            tone={
              preview.valid && !currentPreviewExpired && !currentPreviewStale
                ? "success"
                : "warning"
            }
          >
            {currentPreviewCommitted ? (
              <>
                {T.CONFIRMED} <code>{preview.batchPublicId}</code>
              </>
            ) : currentPreviewExpired ? (
              <>
                {T.EXPIRED} <code>{preview.batchPublicId}</code>
              </>
            ) : currentPreviewStale ? (
              <>
                {T.STALE} <code>{preview.batchPublicId}</code>
              </>
            ) : preview.valid ? (
              T.PREVIEW_VALID
            ) : (
              T.PREVIEW_INVALID
            )}
          </Alert>
          <p className="text-sm text-gray-700">
            {T.ATTEMPT_COUNT}: <strong>{preview.attemptCount}</strong>
            <span className="px-2">·</span>
            {T.ANSWER_COUNT}: <strong>{preview.eligibleAnswerCount}</strong>
          </p>
          <LoadTable loads={preview.examinerLoads} examiners={examiners} />
          {preview.conflicts.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-red-800">{T.CONFLICTS}</h4>
              {preview.conflicts.map((conflict) => (
                <div
                  key={conflict.attemptPublicId}
                  className="rounded border border-red-200 bg-white p-2 text-sm"
                >
                  <p>
                    {T.ATTEMPT}: <code>{conflict.attemptPublicId}</code>
                  </p>
                  <p>
                    {T.CONFLICTING_SCOPES}:{" "}
                    {conflict.conflictingScopes
                      .map((scope) => scopeLabel(scope.type, scope.scopePublicId, classes))
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
                {confirmPreview.isPending ? T.CONFIRMING : T.CONFIRM}
              </button>
            )}
        </div>
      )}

      {confirmPreview.data?.status === "COMMITTED" && !confirmationMatchesPreview && (
        <Alert tone="success">
          {T.CONFIRMED} <code>{confirmPreview.data.batchPublicId}</code>
        </Alert>
      )}
      {confirmPreview.data?.status === "EXPIRED" && !confirmationMatchesPreview && (
        <Alert tone="warning">
          {T.EXPIRED} <code>{confirmPreview.data.batchPublicId}</code>
        </Alert>
      )}
      {confirmPreview.data?.status === "STALE" && !confirmationMatchesPreview && (
        <Alert tone="warning">
          {T.STALE} <code>{confirmPreview.data.batchPublicId}</code>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-800">{T.BATCHES}</h4>
          <span className="text-sm text-gray-500">{T.ASSIGNED_TOTAL(assignedAttemptCount)}</span>
        </div>
        {overview.isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : overview.isError ? (
          <button
            type="button"
            onClick={() => void overview.refetch()}
            className="self-start rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {T.RETRY}
          </button>
        ) : (overview.data?.batches.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500">{T.NO_BATCHES}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-3 py-2">{T.STATUS}</th>
                  <th className="px-3 py-2">{T.MODE_LABEL}</th>
                  <th className="px-3 py-2">{T.ATTEMPT_COUNT}</th>
                  <th className="px-3 py-2">{T.ANSWER_COUNT}</th>
                  <th className="px-3 py-2">{T.CREATED}</th>
                  <th className="px-3 py-2">{T.ACTIONS}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {overview.data?.batches.map((batch) => (
                  <tr key={batch.batchPublicId}>
                    <td className="px-3 py-2">
                      {batch.status === "PREVIEWED" &&
                      Date.parse(batch.previewExpiresAt) <= currentTime
                        ? "EXPIRED"
                        : batch.status}
                    </td>
                    <td className="px-3 py-2">
                      {batch.mode === "RANDOM" ? T.RANDOM_MODE : T.MANUAL_MODE}
                    </td>
                    <td className="px-3 py-2">{batch.attemptCount}</td>
                    <td className="px-3 py-2">{batch.eligibleAnswerCount}</td>
                    <td className="px-3 py-2">{formatDate(batch.createdAt)}</td>
                    <td className="px-3 py-2">
                      {batch.status === "PREVIEWED" &&
                        Date.parse(batch.previewExpiresAt) > currentTime &&
                        confirmPreview.data?.batchPublicId !== batch.batchPublicId && (
                          <button
                            type="button"
                            disabled={confirmPreview.isPending}
                            onClick={() => confirmPreview.mutate(batch.batchPublicId)}
                            className="text-action hover:underline disabled:opacity-50"
                          >
                            {T.CONFIRM}
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!overview.isError && overviewTotalPages > 1 && (
          <div className="flex items-center justify-end gap-3 text-sm">
            <button
              type="button"
              disabled={batchPage === 0 || overview.isFetching}
              onClick={() => setBatchPage((page) => Math.max(0, page - 1))}
              className="rounded border border-gray-300 px-3 py-1.5 disabled:opacity-50"
            >
              {T.PREVIOUS_PAGE}
            </button>
            <span>
              {(overview.data?.page ?? batchPage) + 1} / {overviewTotalPages}
            </span>
            <button
              type="button"
              disabled={batchPage + 1 >= overviewTotalPages || overview.isFetching}
              onClick={() => setBatchPage((page) => page + 1)}
              className="rounded border border-gray-300 px-3 py-1.5 disabled:opacity-50"
            >
              {T.NEXT_PAGE}
            </button>
          </div>
        )}
      </div>
      <LoadTable
        loads={overview.isError ? [] : (overview.data?.committedExaminerLoads ?? [])}
        examiners={examiners}
      />
    </CollapsibleSection>
  );
};

interface LoadTableProps {
  loads: { examinerPublicId: string; attemptCount: number; eligibleAnswerCount: number }[];
  examiners: UserResponse[];
}

function LoadTable({ loads, examiners }: LoadTableProps): ReactElement | null {
  if (loads.length === 0) return null;
  const byId = new Map(examiners.map((examiner) => [examiner.publicId, examiner]));
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-gray-800">{T.LOADS}</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white text-left text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-2">{T.EXAMINER_LABEL}</th>
              <th className="px-3 py-2">{T.ATTEMPT_COUNT}</th>
              <th className="px-3 py-2">{T.ANSWER_COUNT}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loads.map((load) => (
              <tr key={load.examinerPublicId}>
                <td className="px-3 py-2">
                  {byId.get(load.examinerPublicId)
                    ? examinerName(byId.get(load.examinerPublicId) as UserResponse)
                    : load.examinerPublicId}
                </td>
                <td className="px-3 py-2">{load.attemptCount}</td>
                <td className="px-3 py-2">{load.eligibleAnswerCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
