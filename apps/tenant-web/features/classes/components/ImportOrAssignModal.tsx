"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Modal, Select, cn } from "@pte/ui";
import { ApiError } from "@pte/api-client";
import { SkippedRowsReport } from "@/features/examoperations/components";
import { downloadCredentials } from "@/features/examoperations/downloadCredentials";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { parseRosterFile } from "@/features/examoperations/cleanRosterFile";
import { useCreateStudent, useTenantStudents } from "@/features/examoperations/api";
import type { CreatedAccount, RosterRow, SkippedRow } from "@/features/examoperations/types";
import { useClassMemberships } from "@/features/studentSearch/api";
import { IMPORT_OR_ASSIGN_TEXT } from "../constants";
import { useAssignStudent, useBulkAssignStudents, useCreateRosterAccountsForClass } from "../api";
import {
  clearPendingClassAssignment,
  loadPendingClassAssignment,
  savePendingClassAssignment,
} from "../pendingClassAssignment";
import { RosterDropzone } from "./_RosterDropzone";
import { PendingClassAssignmentBanner } from "./PendingClassAssignmentBanner";

const STUDENT_ALREADY_IN_CLASS_CODE = "STUDENT_ALREADY_IN_CLASS";
const T = IMPORT_OR_ASSIGN_TEXT;

interface ImportOrAssignModalProps {
  open: boolean;
  onClose: () => void;
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
}

type Tab = "existing" | "import" | "add";

const TAB_CLASS = (active: boolean): string =>
  cn(
    "rounded-md px-3 py-1.5 text-sm font-medium",
    active ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100",
  );

function isAlreadyInClassError(error: unknown): boolean {
  return error instanceof ApiError && error.message === STUDENT_ALREADY_IN_CLASS_CODE;
}

function assignErrorMessage(error: unknown): string | undefined {
  if (isAlreadyInClassError(error)) return T.alreadyInAnotherClass;
  return errorMessage(error);
}

function mergeAccounts(previous: CreatedAccount[], added: CreatedAccount[]): CreatedAccount[] {
  const byId = new Map(previous.map((account) => [account.publicId, account]));
  added.forEach((account) => byId.set(account.publicId, account));
  return Array.from(byId.values());
}

export const ImportOrAssignModal = ({
  open,
  onClose,
  organizationPublicId,
  programPublicId,
  classPublicId,
}: ImportOrAssignModalProps): ReactElement => {
  const [tab, setTab] = useState<Tab>("existing");
  // Lazy init reads sessionStorage during render — safe only because this
  // modal is only ever mounted client-side (never during SSR/hydration).
  const [pending, setPending] = useState<CreatedAccount[] | null>(() =>
    loadPendingClassAssignment(classPublicId),
  );
  const bulkAssign = useBulkAssignStudents(organizationPublicId, programPublicId, classPublicId);

  /**
   * Merges into the existing pending batch rather than overwriting it — the
   * Excel and one-by-one tabs can each independently create accounts, and a
   * Host may switch tabs before resolving an earlier batch. An overwrite
   * here would silently strand that earlier batch's one-time-only
   * credentials out of `sessionStorage` (the exact failure this phase's
   * Design Constraints require preventing). No-ops on an empty array.
   */
  const handleAccountsCreated = (accounts: CreatedAccount[]): void => {
    if (accounts.length === 0) return;
    setPending((previous) => {
      const merged = mergeAccounts(previous ?? [], accounts);
      savePendingClassAssignment(classPublicId, merged);
      return merged;
    });
  };

  /** Removes exactly the accounts that were just confirmed assigned — never a blanket clear, so an unrelated still-pending batch from the other tab survives. */
  const handleAccountsAssigned = (accounts: CreatedAccount[]): void => {
    const assignedIds = new Set(accounts.map((account) => account.publicId));
    setPending((previous) => {
      const remaining = (previous ?? []).filter((account) => !assignedIds.has(account.publicId));
      if (remaining.length > 0) {
        savePendingClassAssignment(classPublicId, remaining);
        return remaining;
      }
      clearPendingClassAssignment(classPublicId);
      return null;
    });
  };

  const retryPendingAssign = (): void => {
    if (!pending) return;
    bulkAssign.mutate(
      pending.map((account) => account.publicId),
      { onSuccess: () => handleAccountsAssigned(pending) },
    );
  };

  const dismissPending = (): void => {
    clearPendingClassAssignment(classPublicId);
    setPending(null);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.title}
      size="xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {T.close}
        </button>
      }
    >
      {pending && pending.length > 0 && (
        <div className="mb-4">
          <PendingClassAssignmentBanner
            accounts={pending}
            onRetryAssign={retryPendingAssign}
            onDismiss={dismissPending}
            isAssigning={bulkAssign.isPending}
            assignError={bulkAssign.error}
          />
        </div>
      )}

      <div className="mb-4 flex gap-2 rounded-lg bg-gray-50 p-1">
        <button type="button" className={TAB_CLASS(tab === "existing")} onClick={() => setTab("existing")}>
          {T.tabExisting}
        </button>
        <button type="button" className={TAB_CLASS(tab === "import")} onClick={() => setTab("import")}>
          {T.tabImport}
        </button>
        <button type="button" className={TAB_CLASS(tab === "add")} onClick={() => setTab("add")}>
          {T.tabAdd}
        </button>
      </div>

      {tab === "existing" && (
        <ExistingStudentTab
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classPublicId={classPublicId}
          onAssigned={onClose}
        />
      )}
      {tab === "import" && (
        <ImportExcelTab
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classPublicId={classPublicId}
          onCreated={handleAccountsCreated}
          onAssigned={handleAccountsAssigned}
        />
      )}
      {tab === "add" && (
        <AddIndividuallyTab
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classPublicId={classPublicId}
          onCreated={handleAccountsCreated}
          onAssigned={handleAccountsAssigned}
        />
      )}
    </Modal>
  );
};

interface TabScopeProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
}

interface ExistingStudentTabProps extends TabScopeProps {
  onAssigned: () => void;
}

const ExistingStudentTab = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  onAssigned,
}: ExistingStudentTabProps): ReactElement => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const { data: students, isLoading: studentsLoading } = useTenantStudents();
  const { data: memberships, isLoading: membershipsLoading } = useClassMemberships();
  const assignStudent = useAssignStudent(organizationPublicId, programPublicId, classPublicId);

  const loading = studentsLoading || membershipsLoading;
  const assignedIds = new Set((memberships ?? []).map((membership) => membership.studentPublicId));
  const unassignedStudents = (students ?? []).filter((student) => !assignedIds.has(student.publicId));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!selectedStudentId) return;
    assignStudent.mutate({ studentPublicId: selectedStudentId }, { onSuccess: onAssigned });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {!!assignStudent.error && <Alert tone="error">{assignErrorMessage(assignStudent.error)}</Alert>}

      {unassignedStudents.length === 0 && !loading ? (
        <p className="text-sm text-gray-500">{T.noExisting}</p>
      ) : (
        <Select
          label={T.existingLabel}
          placeholder={T.existingPlaceholder}
          value={selectedStudentId}
          disabled={loading}
          onChange={(event) => setSelectedStudentId(event.target.value)}
          options={unassignedStudents.map((student) => ({
            label: `${student.fullName} (${student.email})`,
            value: student.publicId,
          }))}
        />
      )}

      <div>
        <Button
          type="submit"
          disabled={!selectedStudentId}
          isLoading={assignStudent.isPending}
          loadingText={T.assigning}
        >
          {T.assign}
        </Button>
      </div>
    </form>
  );
};

interface ImportExcelTabProps extends TabScopeProps {
  onCreated: (accounts: CreatedAccount[]) => void;
  onAssigned: (accounts: CreatedAccount[]) => void;
}

/**
 * Assign is attempted automatically right after account creation succeeds —
 * there is no separate tab-local "Assign All" button/mutation. Two
 * independent triggers for the same assign step (this tab's own button, and
 * the shared `PendingClassAssignmentBanner`'s "Retry Assigning") would drift
 * out of sync the moment one of them resolved the batch and the other
 * didn't know — the banner (driven by the modal's single `pending` state)
 * is the only manual retry affordance, and it's already visible above
 * whenever an attempt here fails.
 */
const ImportExcelTab = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  onCreated,
  onAssigned,
}: ImportExcelTabProps): ReactElement => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [parseError, setParseError] = useState<string | undefined>();
  const [lastResult, setLastResult] = useState<{ created: CreatedAccount[]; skipped: SkippedRow[] } | null>(null);

  const createAccounts = useCreateRosterAccountsForClass();
  const bulkAssign = useBulkAssignStudents(organizationPublicId, programPublicId, classPublicId);

  const handleReview = async (): Promise<void> => {
    if (!file) return;
    setParseError(undefined);
    try {
      const result = await parseRosterFile(file);
      setRows(result.rows);
    } catch (error) {
      setParseError(errorMessage(error));
    }
  };

  const handleCreateAccounts = (): void => {
    if (!rows) return;
    createAccounts.mutate(rows, {
      onSuccess: (response) => {
        setLastResult({ created: response.created, skipped: response.skipped });
        onCreated(response.created);
        setFile(null);
        setRows(null);
        if (response.created.length > 0) {
          bulkAssign.mutate(
            response.created.map((account) => account.publicId),
            { onSuccess: () => onAssigned(response.created) },
          );
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-gray-900">{T.importHeading}</h4>

      <RosterDropzone
        fileName={file?.name}
        dropPrompt={T.dropPrompt}
        fileInputLabel={T.importHeading}
        onFileSelected={(selected) => {
          setFile(selected);
          setRows(null);
          setLastResult(null);
        }}
      />

      {parseError && <Alert tone="error">{parseError}</Alert>}

      {!rows && !createAccounts.isPending && (
        <div>
          <Button type="button" onClick={() => void handleReview()} disabled={!file}>
            {T.checkFile}
          </Button>
        </div>
      )}

      {rows && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">
            {T.reviewRows}: {rows.length}
          </p>
          {!!createAccounts.error && <Alert tone="error">{errorMessage(createAccounts.error)}</Alert>}
          <div>
            <Button
              type="button"
              onClick={handleCreateAccounts}
              isLoading={createAccounts.isPending}
              loadingText={T.creating}
            >
              {T.createAccounts}
            </Button>
          </div>
        </div>
      )}

      {lastResult && (
        <div className="flex flex-col gap-4">
          <Alert tone="success">{T.accountsCreated.replace("{count}", String(lastResult.created.length))}</Alert>
          <SkippedRowsReport rows={lastResult.skipped} />
          <div>
            <Button type="button" variant="secondary" onClick={() => downloadCredentials(lastResult.created)}>
              {T.download}
            </Button>
          </div>
          {bulkAssign.isPending && <p className="text-sm text-gray-500">{T.assigningAll}</p>}
          {!!bulkAssign.error && (
            <Alert tone="error" title={T.assignErrorTitle}>
              {errorMessage(bulkAssign.error)}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

interface AddIndividuallyTabProps extends TabScopeProps {
  onCreated: (accounts: CreatedAccount[]) => void;
  onAssigned: (accounts: CreatedAccount[]) => void;
}

interface AddStudentInput {
  email: string;
  fullName: string;
  studentCode: string;
  phone: string;
  dateOfBirth: string;
}

const EMPTY_ADD_STUDENT_INPUT: AddStudentInput = {
  email: "",
  fullName: "",
  studentCode: "",
  phone: "",
  dateOfBirth: "",
};

const AddIndividuallyTab = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  onCreated,
  onAssigned,
}: AddIndividuallyTabProps): ReactElement => {
  const [form, setForm] = useState<AddStudentInput>(EMPTY_ADD_STUDENT_INPUT);
  const createStudent = useCreateStudent();
  const assignStudent = useAssignStudent(organizationPublicId, programPublicId, classPublicId);

  const handleChange = (field: keyof AddStudentInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    createStudent.mutate(
      {
        email: form.email,
        fullName: form.fullName,
        studentCode: form.studentCode,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
      },
      {
        onSuccess: (account) => {
          // Persist before assigning — an assign failure must never lose the one-time generated password.
          onCreated([account]);
          setForm(EMPTY_ADD_STUDENT_INPUT);
          assignStudent.mutate(
            { studentPublicId: account.publicId },
            { onSuccess: () => onAssigned([account]) },
          );
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-gray-900">{T.addIndividuallyHeading}</h4>
      {!!createStudent.error && <Alert tone="error">{errorMessage(createStudent.error)}</Alert>}
      {!!assignStudent.error && <Alert tone="error">{assignErrorMessage(assignStudent.error)}</Alert>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={T.emailLabel}
          type="email"
          value={form.email}
          onChange={(event) => handleChange("email", event.target.value)}
          required
        />
        <Input
          label={T.fullNameLabel}
          value={form.fullName}
          onChange={(event) => handleChange("fullName", event.target.value)}
          required
        />
        <Input
          label={T.studentCodeLabel}
          value={form.studentCode}
          onChange={(event) => handleChange("studentCode", event.target.value)}
        />
        <Input
          label={T.phoneLabel}
          value={form.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
        />
        <Input
          type="date"
          label={T.dobLabel}
          value={form.dateOfBirth}
          onChange={(event) => handleChange("dateOfBirth", event.target.value)}
        />
      </div>
      <div>
        <Button
          type="submit"
          isLoading={createStudent.isPending || assignStudent.isPending}
          loadingText={T.submitting}
        >
          {T.submit}
        </Button>
      </div>
    </form>
  );
};
