"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import type {
  CreateExaminerAssignmentPreviewRequest,
  ExaminerAssignmentOverviewResponse,
  ExaminerAssignmentMode,
  UserResponse,
} from "@pte/api-client";
import {
  ActionMenu,
  Alert,
  CollapsibleSection,
  DataTable,
  PaginationControls,
  Select,
  useLocale,
  useToast,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { useDebouncedSearch } from "@/features/search/useDebouncedSearch";
import { EXAMINER_ASSIGNMENT_TEXT as T, SESSION_DETAIL_TEXT } from "../constants";
import { AssignStudentsToExaminerModal, type PickedStudent } from "./AssignStudentsToExaminerModal";
import { ExaminerCards, StudentChips, type ExaminerCardDraft } from "./ExaminerAssignmentCards";
import {
  useActiveExaminers,
  useConfirmExaminerAssignmentPreview,
  useCreateExaminerAssignmentPreview,
  useExaminerAssignmentOverview,
} from "../api";

interface ExaminerAssignmentSectionProps {
  sessionPublicId: string;
  sessionStatus: string;
}

/** Where the student picker was opened from: the shared Random pool or one Manual Examiner card. */
type PickerTarget = { kind: "pool" } | { kind: "card"; cardKey: string };

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

const newCardId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const ExaminerAssignmentSection = ({
  sessionPublicId,
  sessionStatus,
}: ExaminerAssignmentSectionProps): ReactElement => {
  const { locale, t } = useLocale();
  const assignmentLocked = sessionStatus !== "CLOSED";
  const { showToast } = useToast();
  const searchText = useTenantSearchText("examinerBatches");
  const [mode, setMode] = useState<ExaminerAssignmentMode>("RANDOM");
  const [poolStudents, setPoolStudents] = useState<PickedStudent[]>([]);
  const [cards, setCards] = useState<ExaminerCardDraft[]>([]);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [selectedExaminerIds, setSelectedExaminerIds] = useState<string[]>([]);
  const [batchPage, setBatchPage] = useState(0);
  const [batchSearch, setBatchSearch] = useState("");
  const debouncedBatchSearch = useDebouncedSearch(batchSearch);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const examinersQuery = useActiveExaminers();
  const examiners = examinersQuery.data ?? EMPTY_USERS;
  const overview = useExaminerAssignmentOverview(sessionPublicId, batchPage, debouncedBatchSearch);
  const createPreview = useCreateExaminerAssignmentPreview(sessionPublicId);
  const confirmPreview = useConfirmExaminerAssignmentPreview(sessionPublicId);
  const examinersLoading = examinersQuery.isLoading;

  const text = {
    mode: t("tenant.examinerAssignment.mode", T.MODE_LABEL),
    randomMode: t("tenant.examinerAssignment.randomMode", T.RANDOM_MODE),
    manualMode: t("tenant.examinerAssignment.manualMode", T.MANUAL_MODE),
    studentLabel: t("tenant.examinerAssignment.student", T.SCOPE_TYPE_STUDENT),
    addStudents: t("tenant.examinerAssignment.addStudents", T.ADD_STUDENTS),
    addExaminer: t("tenant.examinerAssignment.addExaminer", T.ADD_EXAMINER),
    requiresClosed: t("tenant.examinerAssignment.requiresClosed", T.REQUIRES_CLOSED),
    studentsModalTitle: t("tenant.examinerAssignment.studentsModalTitle", T.STUDENTS_MODAL_TITLE),
    studentsModalAdd: t("tenant.examinerAssignment.studentsModalAdd", T.STUDENTS_MODAL_ADD),
    studentsModalCancel: t("tenant.examinerAssignment.studentsModalCancel", T.STUDENTS_MODAL_CANCEL),
    studentsModalHint: t("tenant.examinerAssignment.studentsModalHint", T.STUDENTS_MODAL_HINT),
    studentsPool: t("tenant.examinerAssignment.studentsPool", T.STUDENTS_POOL),
    cardNoStudents: t("tenant.examinerAssignment.cardNoStudents", T.CARD_NO_STUDENTS),
    manualEmpty: t("tenant.examinerAssignment.manualEmpty", T.MANUAL_EMPTY),
    studentsCount: (count: number) =>
      t("tenant.examinerAssignment.studentsCount", T.STUDENTS_COUNT, { count }),
    remove: t("tenant.examinerAssignment.remove", T.REMOVE_SCOPE),
    examiners: t("tenant.examinerAssignment.examiners", T.EXAMINERS_LABEL),
    examiner: t("tenant.examinerAssignment.examiner", T.EXAMINER_LABEL),
    examinerPlaceholder: t("tenant.examinerAssignment.examinerPlaceholder", T.EXAMINER_PLACEHOLDER),
    noExaminers: t("tenant.examinerAssignment.noExaminers", T.NO_EXAMINERS),
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

  const examinerOptions = useMemo(
    () => examiners.map((examiner) => ({ value: examiner.publicId, label: examinerName(examiner) })),
    [examiners],
  );
  const studentNames = useMemo(
    () =>
      new Map(
        [...poolStudents, ...cards.flatMap((card) => card.students)].map(
          (student) => [student.publicId, student.fullName] as const,
        ),
      ),
    [poolStudents, cards],
  );
  const pickedStudentIds = useMemo(
    () =>
      new Set(
        (mode === "RANDOM" ? poolStudents : cards.flatMap((card) => card.students)).map(
          (student) => student.publicId,
        ),
      ),
    [mode, poolStudents, cards],
  );

  const addExaminerCard = (): void => {
    resetAssignmentFeedback();
    setCards((previous) => [
      ...previous,
      { key: newCardId(), examinerPublicId: "", students: [] },
    ]);
  };
  const changeCardExaminer = (cardKey: string, examinerPublicId: string): void => {
    resetAssignmentFeedback();
    setCards((previous) =>
      previous.map((card) => (card.key === cardKey ? { ...card, examinerPublicId } : card)),
    );
  };
  const removeCard = (cardKey: string): void => {
    resetAssignmentFeedback();
    setCards((previous) => previous.filter((card) => card.key !== cardKey));
  };
  const removeCardStudent = (cardKey: string, studentPublicId: string): void => {
    resetAssignmentFeedback();
    setCards((previous) =>
      previous.map((card) =>
        card.key === cardKey
          ? { ...card, students: card.students.filter((s) => s.publicId !== studentPublicId) }
          : card,
      ),
    );
  };
  const removePoolStudent = (studentPublicId: string): void => {
    resetAssignmentFeedback();
    setPoolStudents((previous) => previous.filter((s) => s.publicId !== studentPublicId));
  };
  const addPickedStudents = (students: PickedStudent[]): void => {
    if (!pickerTarget) return;
    resetAssignmentFeedback();
    if (pickerTarget.kind === "pool") {
      setPoolStudents((previous) => [...previous, ...students]);
      return;
    }
    setCards((previous) =>
      previous.map((card) =>
        card.key === pickerTarget.cardKey
          ? { ...card, students: [...card.students, ...students] }
          : card,
      ),
    );
  };

  const pickerExaminerId =
    pickerTarget?.kind === "card"
      ? cards.find((card) => card.key === pickerTarget.cardKey)?.examinerPublicId
      : undefined;
  const pickerExaminerLabel = examinerOptions.find(
    (option) => option.value === pickerExaminerId,
  )?.label;
  const pickerTitle = pickerExaminerLabel
    ? t("tenant.examinerAssignment.studentsModalTitleFor", T.STUDENTS_MODAL_TITLE_FOR, {
        examiner: pickerExaminerLabel,
      })
    : text.studentsModalTitle;

  const canPreview =
    !assignmentLocked &&
    !examinersQuery.isLoading &&
    !examinersQuery.isError &&
    !createPreview.isPending &&
    (mode === "RANDOM"
      ? poolStudents.length > 0 && selectedExaminerIds.length > 0
      : cards.length > 0 &&
        cards.every((card) => card.examinerPublicId.length > 0 && card.students.length > 0));

  const createRequest = (): CreateExaminerAssignmentPreviewRequest =>
    mode === "RANDOM"
      ? {
          mode,
          scopes: poolStudents.map((student) => ({
            type: "STUDENT" as const,
            scopePublicId: student.publicId,
            examinerPublicId: null,
          })),
          examinerPublicIds: selectedExaminerIds,
        }
      : {
          mode,
          scopes: cards.flatMap((card) =>
            card.students.map((student) => ({
              type: "STUDENT" as const,
              scopePublicId: student.publicId,
              examinerPublicId: card.examinerPublicId,
            })),
          ),
          examinerPublicIds: [],
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

  const confirmAssignment = (batchPublicId: string): void => {
    confirmPreview.mutate(batchPublicId, {
      onSuccess: (result) => {
        if (result.status === "COMMITTED") {
          showToast(`${text.confirmed} ${result.batchPublicId}`, { tone: "success" });
        } else if (result.status === "EXPIRED") {
          showToast(`${text.expired} ${result.batchPublicId}`, { tone: "warning" });
        } else if (result.status === "STALE") {
          showToast(`${text.stale} ${result.batchPublicId}`, { tone: "warning" });
        }
      },
    });
  };

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
      {examinersQuery.isError && <Alert tone="error">{examinersError}</Alert>}
      {overviewError && <Alert tone="error">{overviewError}</Alert>}
      {previewError && <Alert tone="error">{previewError}</Alert>}
      {confirmError && <Alert tone="error">{confirmError}</Alert>}

      {assignmentLocked && <Alert tone="warning">{text.requiresClosed}</Alert>}

      <fieldset disabled={assignmentLocked} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
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

        {mode === "RANDOM" ? (
          <>
            <div className="flex flex-col gap-3 rounded-md border border-[var(--shell-border)] p-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-[var(--ink-primary)]">
                  {text.studentsPool}
                </h4>
                <span className="text-sm text-[var(--ink-secondary)]">
                  {text.studentsCount(poolStudents.length)}
                </span>
              </div>
              {poolStudents.length === 0 ? (
                <p className="text-sm text-[var(--ink-secondary)]">{text.noScopes}</p>
              ) : (
                <StudentChips
                  students={poolStudents}
                  removeLabel={text.remove}
                  onRemove={removePoolStudent}
                />
              )}
              <button
                type="button"
                onClick={() => setPickerTarget({ kind: "pool" })}
                className="self-start rounded-lg border border-[var(--shell-border)] px-3 py-1.5 text-sm text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]"
              >
                + {text.addStudents}
              </button>
            </div>

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
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.length === 0 && (
              <p className="text-sm text-[var(--ink-secondary)]">{text.manualEmpty}</p>
            )}
            {!examinersLoading && !examinersQuery.isError && examiners.length === 0 && (
              <p className="text-sm text-[var(--ink-secondary)]">{text.noExaminers}</p>
            )}
            <ExaminerCards
              cards={cards}
              examinerOptions={examinerOptions}
              labels={{
                examiner: text.examiner,
                examinerPlaceholder: text.examinerPlaceholder,
                addStudents: text.addStudents,
                noStudents: text.cardNoStudents,
                remove: text.remove,
                count: text.studentsCount,
              }}
              onExaminerChange={changeCardExaminer}
              onAddStudents={(cardKey) => setPickerTarget({ kind: "card", cardKey })}
              onRemoveStudent={removeCardStudent}
              onRemoveCard={removeCard}
            />
            <button
              type="button"
              disabled={examinersLoading || cards.length >= examiners.length}
              onClick={addExaminerCard}
              className="self-start rounded-lg border border-[var(--shell-border)] px-3 py-1.5 text-sm text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              + {text.addExaminer}
            </button>
          </div>
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
      </fieldset>

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
                      .map(
                        (scope) =>
                          `${text.studentLabel} ${studentNames.get(scope.scopePublicId) ?? scope.scopePublicId}`,
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
                disabled={assignmentLocked || confirmPreview.isPending}
                onClick={() => confirmAssignment(preview.batchPublicId as string)}
                className="self-start rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:opacity-50"
              >
                {confirmPreview.isPending ? text.confirming : text.confirm}
              </button>
            )}
        </div>
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
            searchPlaceholder={searchText.placeholder}
            searchAriaLabel={searchText.ariaLabel}
            searchValue={batchSearch}
            onSearchChange={(value) => {
              setBatchSearch(value);
              setBatchPage(0);
            }}
            rowActionsHeader={text.actions}
            clientSideFiltering={false}
            clientSidePagination={false}
            rowActions={(batch) =>
              batch.status === "PREVIEWED" &&
              Date.parse(batch.previewExpiresAt) > currentTime &&
              confirmPreview.data?.batchPublicId !== batch.batchPublicId ? (
                <ActionMenu
                  label={text.actions}
                  items={[
                    {
                      label: text.confirm,
                      disabled: confirmPreview.isPending,
                      onSelect: () => confirmAssignment(batch.batchPublicId),
                    },
                  ]}
                />
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
      <AssignStudentsToExaminerModal
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        sessionPublicId={sessionPublicId}
        title={pickerTitle}
        labels={{
          hint: text.studentsModalHint,
          add: text.studentsModalAdd,
          cancel: text.studentsModalCancel,
        }}
        excludedStudentIds={pickedStudentIds}
        onAdd={addPickedStudents}
      />
    </CollapsibleSection>
  );
};

interface LoadTableProps {
  loads: { examinerPublicId: string; attemptCount: number }[];
  examiners: UserResponse[];
  labels: {
    examiner: string;
    attempts: string;
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
        showSearch={false}
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
          ] satisfies DataTableColumn<LoadTableProps["loads"][number]>[]
        }
        rows={loads}
        getRowKey={(load) => load.examinerPublicId}
        emptyTitle={labels.noBatches}
      />
    </div>
  );
}
