"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { ExaminerAssignmentRosterRow, UserResponse } from "@pte/api-client";
import {
  ActionMenu,
  Alert,
  Button,
  CollapsibleSection,
  ConfirmDialog,
  DataTable,
  Modal,
  Select,
  useLocale,
  UsersIcon,
  useToast,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { EXAMINER_ASSIGNMENT_TEXT as T, SESSION_DETAIL_TEXT } from "../constants";
import { randomExaminerAssignment } from "../utils/randomExaminerAssignment";
import {
  useActiveExaminers,
  useCommitExaminerAssignment,
  useExaminerAssignmentRoster,
  useReassignExaminer,
} from "../api";

interface ExaminerAssignmentSectionProps {
  sessionPublicId: string;
  sessionStatus: string;
}

const EMPTY_USERS: UserResponse[] = [];
const EMPTY_ROWS: ExaminerAssignmentRosterRow[] = [];

function examinerName(examiner: UserResponse): string {
  return examiner.fullName?.trim() || examiner.email || examiner.username;
}

export const ExaminerAssignmentSection = ({
  sessionPublicId,
  sessionStatus,
}: ExaminerAssignmentSectionProps): ReactElement => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const searchText = useTenantSearchText("examinerRoster");
  const [selectedExaminerIds, setSelectedExaminerIds] = useState<string[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reassigning, setReassigning] = useState<ExaminerAssignmentRosterRow | null>(null);
  const [newExaminerId, setNewExaminerId] = useState("");
  const examinersQuery = useActiveExaminers();
  const rosterQuery = useExaminerAssignmentRoster(sessionPublicId);
  const commit = useCommitExaminerAssignment(sessionPublicId);
  const reassign = useReassignExaminer(sessionPublicId);

  const examiners = examinersQuery.data ?? EMPTY_USERS;
  const rows = rosterQuery.data?.rows ?? EMPTY_ROWS;
  const committed = rosterQuery.data?.locked ?? false;
  const examinersLoading = examinersQuery.isLoading;
  const editable = sessionStatus === "CLOSED" && !committed;

  const text = {
    requiresClosed: t("tenant.examinerAssignment.requiresClosed", T.REQUIRES_CLOSED),
    lockedNotice: t("tenant.examinerAssignment.lockedNotice", T.LOCKED_NOTICE),
    hint: t("tenant.examinerAssignment.hint", T.HINT),
    examiners: t("tenant.examinerAssignment.examiners", T.EXAMINERS_LABEL),
    examiner: t("tenant.examinerAssignment.examiner", T.EXAMINER_LABEL),
    student: t("tenant.examinerAssignment.student", T.SCOPE_TYPE_STUDENT),
    examinerPlaceholder: t("tenant.examinerAssignment.examinerPlaceholder", T.EXAMINER_PLACEHOLDER),
    noExaminers: t("tenant.examinerAssignment.noExaminers", T.NO_EXAMINERS),
    loading: t("tenant.examinerAssignment.loading", T.LOADING),
    retry: t("tenant.examinerAssignment.retry", T.RETRY),
    progressColumn: t("tenant.examinerAssignment.progressColumn", T.PROGRESS_COLUMN),
    statusNotStarted: t("tenant.examinerAssignment.statusNotStarted", T.STATUS_NOT_STARTED),
    statusInProgress: t("tenant.examinerAssignment.statusInProgress", T.STATUS_IN_PROGRESS),
    statusCompleted: t("tenant.examinerAssignment.statusCompleted", T.STATUS_COMPLETED),
    draftCount: (count: number) => t("tenant.examinerAssignment.draftCount", T.DRAFT_COUNT, { count }),
    changeExaminer: t("tenant.examinerAssignment.changeExaminer", T.CHANGE_EXAMINER),
    reassignTitle: t("tenant.examinerAssignment.reassignTitle", T.REASSIGN_TITLE),
    reassignDescription: (count: number) =>
      t("tenant.examinerAssignment.reassignDescription", T.REASSIGN_DESCRIPTION, { count }),
    reassignConfirm: t("tenant.examinerAssignment.reassignConfirm", T.REASSIGN_CONFIRM),
    reassignPending: t("tenant.examinerAssignment.reassignPending", T.REASSIGN_PENDING),
    reassignDone: t("tenant.examinerAssignment.reassignDone", T.REASSIGN_DONE),
    newExaminer: t("tenant.examinerAssignment.newExaminer", T.NEW_EXAMINER),
    randomize: t("tenant.examinerAssignment.randomize", T.RANDOMIZE),
    commit: t("tenant.examinerAssignment.commit", T.COMMIT),
    committing: t("tenant.examinerAssignment.committing", T.COMMITTING),
    cancel: t("tenant.examinerAssignment.cancel", T.CANCEL),
    commitTitle: t("tenant.examinerAssignment.commitTitle", T.COMMIT_TITLE),
    commitDescription: t("tenant.examinerAssignment.commitDescription", T.COMMIT_DESCRIPTION),
    committed: t("tenant.examinerAssignment.confirmed", T.CONFIRMED),
    empty: t("tenant.examinerAssignment.empty", T.EMPTY),
    unknownStudent: t("tenant.examinerAssignment.unknownStudent", T.UNKNOWN_STUDENT),
    progress: (assigned: number, total: number) =>
      t("tenant.examinerAssignment.progress", T.PROGRESS, { assigned, total }),
  };

  const examinerOptions = useMemo(
    () => examiners.map((examiner) => ({ value: examiner.publicId, label: examinerName(examiner) })),
    [examiners],
  );
  const examinerLabels = useMemo(
    () => new Map(examinerOptions.map((option) => [option.value, option.label])),
    [examinerOptions],
  );

  const examinerOf = (row: ExaminerAssignmentRosterRow): string =>
    committed ? (row.examinerPublicId ?? "") : (draft[row.attemptPublicId] ?? "");
  const assignedCount = rows.filter((row) => examinerOf(row).length > 0).length;
  const canCommit = editable && rows.length > 0 && assignedCount === rows.length && !commit.isPending;
  const canRandomize = editable && rows.length > 0 && selectedExaminerIds.length > 0;

  const toggleExaminer = (publicId: string): void =>
    setSelectedExaminerIds((previous) =>
      previous.includes(publicId)
        ? previous.filter((id) => id !== publicId)
        : [...previous, publicId],
    );
  const randomize = (): void =>
    setDraft(
      randomExaminerAssignment(
        rows.map((row) => row.attemptPublicId),
        selectedExaminerIds,
      ),
    );
  const changeExaminer = (attemptPublicId: string, examinerPublicId: string): void =>
    setDraft((previous) => ({ ...previous, [attemptPublicId]: examinerPublicId }));

  const submit = (): void =>
    commit.mutate(
      {
        entries: rows.map((row) => ({
          attemptPublicId: row.attemptPublicId,
          examinerPublicId: draft[row.attemptPublicId],
        })),
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          showToast(text.committed, { tone: "success" });
        },
        onError: () => setConfirmOpen(false),
      },
    );

  const closeReassign = (): void => {
    setReassigning(null);
    setNewExaminerId("");
  };
  const submitReassign = (): void => {
    if (!reassigning || newExaminerId.length === 0) return;
    reassign.mutate(
      {
        attemptPublicId: reassigning.attemptPublicId,
        payload: { examinerPublicId: newExaminerId },
      },
      {
        onSuccess: () => {
          closeReassign();
          showToast(text.reassignDone, { tone: "success" });
        },
        onError: closeReassign,
      },
    );
  };
  const workStatusLabel = (row: ExaminerAssignmentRosterRow): string => {
    if (row.workStatus === "COMPLETED") return text.statusCompleted;
    if (row.workStatus === "IN_PROGRESS" || row.draftCount > 0) {
      return row.draftCount > 0
        ? `${text.statusInProgress} · ${text.draftCount(row.draftCount)}`
        : text.statusInProgress;
    }
    return text.statusNotStarted;
  };
  const reassignOptions = examinerOptions.filter(
    (option) => option.value !== reassigning?.examinerPublicId,
  );

  const columns: DataTableColumn<ExaminerAssignmentRosterRow>[] = [
    {
      key: "student",
      header: text.student,
      filterAccessor: (row) => `${row.studentName ?? ""} ${row.studentEmail ?? ""}`,
      sortAccessor: (row) => row.studentName ?? "",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-[var(--ink-primary)]">{row.studentName ?? text.unknownStudent}</span>
          {row.studentEmail && (
            <span className="text-xs text-[var(--ink-secondary)]">{row.studentEmail}</span>
          )}
        </div>
      ),
    },
    {
      key: "examiner",
      header: text.examiner,
      filterAccessor: (row) => examinerLabels.get(examinerOf(row)) ?? "",
      sortAccessor: (row) => examinerLabels.get(examinerOf(row)) ?? "",
      cell: (row) =>
        editable ? (
          <Select
            variant="table"
            size="sm"
            aria-label={`${text.examiner}: ${row.studentName ?? row.attemptPublicId}`}
            placeholder={text.examinerPlaceholder}
            value={examinerOf(row)}
            options={examinerOptions}
            onChange={(event) => changeExaminer(row.attemptPublicId, event.target.value)}
          />
        ) : (
          (examinerLabels.get(examinerOf(row)) ?? "—")
        ),
    },
    ...(committed
      ? [
          {
            key: "progress",
            header: text.progressColumn,
            cell: workStatusLabel,
          } satisfies DataTableColumn<ExaminerAssignmentRosterRow>,
        ]
      : []),
  ];

  const loadError = errorMessage(rosterQuery.error);
  const examinersError = errorMessage(examinersQuery.error);
  const commitError = errorMessage(commit.error) ?? errorMessage(reassign.error);

  return (
    <CollapsibleSection
      title={t("tenant.examinerAssignment.title", SESSION_DETAIL_TEXT.EXAMINER_ASSIGNMENTS_SECTION)}
      className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
      contentClassName="flex flex-col gap-5"
    >
      {examinersQuery.isError && <Alert tone="error">{examinersError}</Alert>}
      {rosterQuery.isError && <Alert tone="error">{loadError}</Alert>}
      {commitError && <Alert tone="error">{commitError}</Alert>}
      {sessionStatus !== "CLOSED" && !committed && (
        <Alert tone="warning">{text.requiresClosed}</Alert>
      )}
      {committed && <Alert tone="success">{text.lockedNotice}</Alert>}

      {editable && (
        <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
          <p className="text-sm text-[var(--ink-secondary)]">{text.hint}</p>
          <fieldset className="flex flex-col gap-2 rounded-md border border-[var(--shell-border)] p-3">
            <legend className="px-1 text-sm font-semibold text-[var(--ink-primary)]">
              {text.examiners}
            </legend>
            {examinersLoading ? (
              <p className="text-sm text-[var(--ink-secondary)]">{text.loading}</p>
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
          <Button
            variant="secondary"
            className="self-start"
            disabled={!canRandomize}
            onClick={randomize}
          >
            {text.randomize}
          </Button>
        </fieldset>
      )}

      {rosterQuery.isError ? (
        <Button variant="secondary" className="self-start" onClick={() => void rosterQuery.refetch()}>
          {text.retry}
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          {editable && (
            <span className="text-sm text-[var(--ink-secondary)]">
              {text.progress(assignedCount, rows.length)}
            </span>
          )}
          <DataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.attemptPublicId}
            isLoading={rosterQuery.isLoading}
            emptyTitle={text.empty}
            searchPlaceholder={searchText.placeholder}
            searchAriaLabel={searchText.ariaLabel}
            rowActions={
              committed
                ? (row) =>
                    row.reassignable ? (
                      <ActionMenu
                        items={[
                          {
                            label: text.changeExaminer,
                            icon: UsersIcon,
                            onSelect: () => setReassigning(row),
                          },
                        ]}
                      />
                    ) : null
                : undefined
            }
          />
        </div>
      )}

      {editable && (
        <Button
          variant="primary"
          className="self-start"
          disabled={!canCommit}
          onClick={() => setConfirmOpen(true)}
        >
          {text.commit}
        </Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={text.commitTitle}
        description={text.commitDescription}
        confirmLabel={commit.isPending ? text.committing : text.commit}
        cancelLabel={text.cancel}
        isConfirming={commit.isPending}
        onConfirm={submit}
        onClose={() => setConfirmOpen(false)}
      />

      <Modal
        open={reassigning !== null}
        title={text.reassignTitle}
        size="sm"
        onClose={closeReassign}
        isDismissDisabled={reassign.isPending}
        footer={
          <>
            <Button variant="ghost" onClick={closeReassign} disabled={reassign.isPending}>
              {text.cancel}
            </Button>
            <Button
              variant="primary"
              isLoading={reassign.isPending}
              disabled={newExaminerId.length === 0}
              onClick={submitReassign}
            >
              {reassign.isPending ? text.reassignPending : text.reassignConfirm}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 text-sm text-gray-600">
          <p>{text.reassignDescription(reassigning?.draftCount ?? 0)}</p>
          <Select
            aria-label={text.newExaminer}
            placeholder={text.examinerPlaceholder}
            value={newExaminerId}
            options={reassignOptions}
            onChange={(event) => setNewExaminerId(event.target.value)}
          />
        </div>
      </Modal>
    </CollapsibleSection>
  );
};
