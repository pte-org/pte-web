"use client";

import { useState, type ReactElement } from "react";
import { Modal, cn } from "@pte/ui";
import type { CreatedAccount } from "@/features/examoperations/types";
import { useBulkAssignStudents } from "../api";
import { IMPORT_OR_ASSIGN_TEXT } from "../constants";
import {
  clearPendingClassAssignment,
  loadPendingClassAssignment,
  savePendingClassAssignment,
} from "../pendingClassAssignment";
import { AddIndividuallyTab } from "./_AddIndividuallyTab";
import { ExistingStudentTab } from "./_ExistingStudentTab";
import { ImportExcelTab } from "./_ImportExcelTab";
import { PendingClassAssignmentBanner } from "./PendingClassAssignmentBanner";

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

function mergeAccounts(previous: CreatedAccount[], added: CreatedAccount[]): CreatedAccount[] {
  const byId = new Map(previous.map((account) => [account.publicId, account]));
  added.forEach((account) => byId.set(account.publicId, account));
  return Array.from(byId.values());
}

/**
 * Shell for the three "add learners" paths. Each tab lives in its own file
 * (`_`-prefixed, so it stays private to `features/classes`); this file owns
 * only the tab switcher and the cross-tab pending-credentials batch, which
 * the Excel and Add-Individually tabs both need to write into.
 */
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
        <button
          type="button"
          className={TAB_CLASS(tab === "existing")}
          onClick={() => setTab("existing")}
        >
          {T.tabExisting}
        </button>
        <button
          type="button"
          className={TAB_CLASS(tab === "import")}
          onClick={() => setTab("import")}
        >
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
