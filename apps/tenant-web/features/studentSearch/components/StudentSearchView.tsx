"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import type { StudentRosterRow } from "@pte/api-client";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Button,
  CheckCircleIcon,
  ConfirmDialog,
  DataTable,
  EyeIcon,
  LockIcon,
  PaginationControls,
  StatusBadge,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { useClasses, useAllTenantClasses } from "@/features/classes/api";
import { useMyOrganizations } from "@/features/programs/api";
import {
  ADD_STUDENT_GUARD_TEXT,
  ASSIGN_DEEPLINK_TEXT,
  STUDENT_ROSTER_FILTER_TEXT,
  STUDENT_SEARCH_ACTIONS_TEXT,
  STUDENT_SEARCH_TABLE_HEADERS,
  STUDENT_SEARCH_TEXT,
  STUDENT_STATUS_FILTER_OPTIONS,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_VARIANT,
} from "../constants";
import { useReactivateStudent, useStudentRoster, useSuspendStudent } from "../api";
import { ManageStudentsModal } from "./ManageStudentsModal";
import { LockedFilterBanner } from "./LockedFilterBanner";
import { ClassBlockedAlert } from "./ClassBlockedAlert";
import { useAssignStudentsDeeplink } from "./useAssignStudentsDeeplink";
import {
  AccountDetailsModal,
  GeneratedCredentialsModal,
  useGenerateStudentCredentials,
} from "@/features/userManagement";
import type { AccountDetails, GeneratedCredentials } from "@/features/userManagement";

export const StudentSearchView = (): ReactElement => {
  const labels = useOrgLabels();
  const { t } = useLocale();
  const text = {
    add: t("tenant.students.add", STUDENT_SEARCH_ACTIONS_TEXT.add),
    import: t("tenant.students.import", STUDENT_SEARCH_ACTIONS_TEXT.import),
    fullName: t("tenant.students.fullName", STUDENT_SEARCH_TABLE_HEADERS.NAME),
    account: t("tenant.students.account", STUDENT_SEARCH_TABLE_HEADERS.ACCOUNT),
    studentCode: t("tenant.students.studentCode", STUDENT_SEARCH_TABLE_HEADERS.CODE),
    email: t("tenant.students.email", STUDENT_SEARCH_TABLE_HEADERS.EMAIL),
    phone: t("tenant.students.phone", STUDENT_SEARCH_TABLE_HEADERS.PHONE),
    class: t("tenant.students.class", labels.class),
    program: t("tenant.students.program", labels.program),
    status: t("tenant.students.status", STUDENT_SEARCH_TABLE_HEADERS.STATUS),
    active: t("tenant.students.active", STUDENT_STATUS_LABELS.ACTIVE),
    suspended: t("tenant.students.suspended", STUDENT_STATUS_LABELS.SUSPENDED),
    unassigned: t("tenant.students.unassigned", STUDENT_SEARCH_TEXT.unassigned),
    actions: t("tenant.students.actions", STUDENT_ROSTER_FILTER_TEXT.actions),
    viewDetails: t("tenant.students.viewDetails", STUDENT_ROSTER_FILTER_TEXT.viewDetails),
    generatePassword: t(
      "tenant.students.generatePassword",
      STUDENT_ROSTER_FILTER_TEXT.generatePassword,
    ),
    suspend: t("tenant.students.suspend", STUDENT_ROSTER_FILTER_TEXT.suspend),
    reactivate: t("tenant.students.reactivate", STUDENT_ROSTER_FILTER_TEXT.reactivate),
    emptyTitle: t("tenant.students.empty", STUDENT_SEARCH_TEXT.emptyTitle),
    emptyDescription: t(
      "tenant.students.emptyDescription",
      STUDENT_ROSTER_FILTER_TEXT.emptyDescription,
    ),
    searchPlaceholder: t(
      "tenant.students.searchPlaceholder",
      STUDENT_ROSTER_FILTER_TEXT.searchPlaceholder,
    ),
    noClassesTitle: t("tenant.students.noClassesTitle", ADD_STUDENT_GUARD_TEXT.title),
    noClassesBody: t("tenant.students.noClassesBody", ADD_STUDENT_GUARD_TEXT.body),
    goToClasses: t("tenant.students.goToClasses", ADD_STUDENT_GUARD_TEXT.cta),
    dismiss: t("tenant.students.dismiss", ADD_STUDENT_GUARD_TEXT.dismiss),
    syncing: t("tenant.students.syncing", STUDENT_ROSTER_FILTER_TEXT.syncing),
    confirmSuspendTitle: t(
      "tenant.students.confirmSuspendTitle",
      STUDENT_ROSTER_FILTER_TEXT.confirmSuspendTitle,
    ),
    confirmSuspendDescription: (name: string) =>
      t(
        "tenant.students.confirmSuspendDescription",
        STUDENT_ROSTER_FILTER_TEXT.confirmSuspendDescription(name),
        { name },
      ),
    confirm: t("tenant.students.confirmSuspend", STUDENT_ROSTER_FILTER_TEXT.confirm),
    cancel: t("tenant.students.cancel", STUDENT_ROSTER_FILTER_TEXT.cancel),
    generatePasswordConfirmTitle: t(
      "tenant.students.generatePasswordConfirmTitle",
      STUDENT_ROSTER_FILTER_TEXT.generatePasswordConfirmTitle,
    ),
    generatePasswordConfirmDescription: (name: string) =>
      t(
        "tenant.students.generatePasswordConfirmDescription",
        STUDENT_ROSTER_FILTER_TEXT.generatePasswordConfirmDescription(name),
        { name },
      ),
    generatePasswordConfirm: t(
      "tenant.students.generatePasswordConfirm",
      STUDENT_ROSTER_FILTER_TEXT.generatePasswordConfirm,
    ),
    classBlocked: (status: string, name: string) =>
      t("tenant.students.classBlocked", ASSIGN_DEEPLINK_TEXT.classBlocked(status, name), {
        status,
        name,
      }),
    lockedFilterBanner: (name: string) =>
      t("tenant.students.lockedFilterBanner", ASSIGN_DEEPLINK_TEXT.lockedFilterBanner(name), {
        name,
      }),
    clearFilter: t("tenant.students.clearFilter", ASSIGN_DEEPLINK_TEXT.clearFilter),
    loadFailed: t("tenant.students.loadFailed", STUDENT_ROSTER_FILTER_TEXT.loadFailed),
    noPrograms: t("tenant.students.noPrograms", STUDENT_ROSTER_FILTER_TEXT.noPrograms),
    noClasses: t("tenant.students.noClasses", STUDENT_ROSTER_FILTER_TEXT.noClasses),
    allStatuses: t("tenant.students.allStatuses", "All statuses"),
  };
  const statusLabels = { ACTIVE: text.active, SUSPENDED: text.suspended };
  const statusFilterOptions = [
    { value: "", label: text.allStatuses },
    { value: "ACTIVE", label: text.active },
    { value: "SUSPENDED", label: text.suspended },
  ];
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [manageMode, setManageMode] = useState<"add" | "import" | null>(null);
  const [guardOpen, setGuardOpen] = useState(false);
  const [studentToSuspend, setStudentToSuspend] = useState<StudentRosterRow | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<StudentRosterRow | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<StudentRosterRow | null>(null);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const [keepPreviousRows, setKeepPreviousRows] = useState(false);

  // Read deeplink params synchronously after hydration. `useSearchParams` is
  // sync on the client; reading in the render body avoids a useEffect delay.
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramOrg = searchParams.get("organizationPublicId") ?? "";
  const paramProgram = searchParams.get("programPublicId") ?? "";
  const paramClass = searchParams.get("classPublicId") ?? "";
  const paramModal = searchParams.get("modal") ?? "";

  // Lazy-initialize filter state from URL deeplink on mount.
  // React 19 prefers deriving state in render over setState-in-effect.
  const [programPublicId, setProgramPublicId] = useState(() => paramProgram || "");
  const [classPublicId, setClassPublicId] = useState(() => paramClass || "");

  const { data: organizations } = useMyOrganizations();
  const organizationPublicId = paramOrg || organizations?.[0]?.publicId || "";
  const { data: classes } = useClasses(organizationPublicId, programPublicId);

  const deeplink = useAssignStudentsDeeplink(
    paramOrg,
    paramProgram,
    paramClass,
    paramModal,
    classes,
  );

  // One-shot auto-open: when deeplink + active class + ?modal=add resolve,
  // set manageMode to "add". Guarded by deeplink.autoOpenFired so it only
  // fires once even if conditions flip between renders.
  if (
    deeplink.shouldAutoOpenModal &&
    !deeplink.autoOpenFired &&
    manageMode !== "add" &&
    !deeplink.classFilterLocked
  ) {
    deeplink.setAutoOpenFired(true);
    setManageMode("add");
  }
  // Tenant-wide guard: blocks Add/Import buttons when the tenant has zero
  // Classes across all Programs/Organizations. Reuses useAllTenantClasses()
  // (already cached by Phase 2's /host/classes page) so this is free on
  // warm caches.
  const { data: tenantClasses, isLoading: tenantClassesLoading } = useAllTenantClasses();
  const hasAnyClass = (tenantClasses?.length ?? 0) > 0;
  const rosterQuery = {
    page,
    size,
    programPublicId: programPublicId || undefined,
    classPublicId: classPublicId || undefined,
  };
  const roster = useStudentRoster(rosterQuery);
  const suspend = useSuspendStudent();
  const reactivate = useReactivateStudent();
  const generateCredentials = useGenerateStudentCredentials();
  const isNewFilterPending = roster.isPlaceholderData && !keepPreviousRows;
  const visibleResult = isNewFilterPending ? undefined : roster.data;
  const rows = visibleResult?.data ?? [];
  const queryError = errorMessage(roster.error);
  const mutationError = errorMessage(
    suspend.error ?? reactivate.error ?? generateCredentials.error,
  );

  const resetPage = (): void => {
    setKeepPreviousRows(false);
    setPage(0);
  };

  const trySetManageMode = (nextMode: "add" | "import"): void => {
    if (tenantClassesLoading) {
      // Don't block UX on the guard fetch — let the modal open as before.
      setManageMode(nextMode);
      return;
    }
    if (!hasAnyClass) {
      setGuardOpen(true);
      setManageMode(null);
      return;
    }
    setManageMode(nextMode);
  };

  // Resets the deeplink prefill state and unlocks Program + Class filters.
  // Replaces the URL so a browser Back from the cleared state returns to the
  // source class page (not to the prefill URL).
  const clearLockedFilter = (): void => {
    deeplink.setClassFilterLocked(false);
    deeplink.setPersistedClassName(null);
    deeplink.setPersistedBlockedReason(null);
    deeplink.setWasPrefilledByDeeplink(false);
    setProgramPublicId("");
    setClassPublicId("");
    setKeepPreviousRows(false);
    setPage(0);
    router.replace("/host/students");
  };

  const handlePageChange = (nextPage: number): void => {
    setKeepPreviousRows(true);
    setPage(nextPage);
  };

  const columns: DataTableColumn<StudentRosterRow>[] = [
    {
      key: "name",
      header: text.fullName,
      cell: (row) => <span className="font-medium text-gray-900">{row.fullName}</span>,
    },
    { key: "account", header: text.account, cell: (row) => row.username },
    {
      key: "code",
      header: text.studentCode,
      cell: (row) => row.studentCode ?? STUDENT_SEARCH_TEXT.emptyValue,
    },
    { key: "email", header: text.email, cell: (row) => row.email },
    {
      key: "phone",
      header: text.phone,
      cell: (row) => row.phone ?? STUDENT_SEARCH_TEXT.emptyValue,
    },
    {
      key: "class",
      header: text.class,
      cell: (row) => row.className ?? text.unassigned,
    },
    {
      key: "program",
      header: text.program,
      cell: (row) => row.programName ?? STUDENT_SEARCH_TEXT.emptyValue,
    },
    {
      key: "status",
      header: text.status,
      filterOptions: statusFilterOptions,
      filterAccessor: (row) => row.status,
      cell: (row) => (
        <StatusBadge
          label={statusLabels[row.status] ?? row.status}
          variant={STUDENT_STATUS_VARIANT[row.status]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {deeplink.classBlockedReason && deeplink.prefilledClassName && (
        <ClassBlockedAlert
          status={deeplink.classBlockedReason}
          className={deeplink.prefilledClassName}
          classBlockedLabel={text.classBlocked}
        />
      )}
      {deeplink.classFilterLocked && deeplink.prefilledClassName && (
        <LockedFilterBanner
          className={deeplink.prefilledClassName}
          onClearFilter={clearLockedFilter}
          clearFilterLabel={text.clearFilter}
          lockedFilterBannerLabel={text.lockedFilterBanner}
        />
      )}

      {queryError && <Alert tone="error">{queryError || text.loadFailed}</Alert>}
      {mutationError && <Alert tone="error">{mutationError}</Alert>}
      {roster.isFetching && visibleResult && <Alert tone="info">{text.syncing}</Alert>}
      {guardOpen && (
        <div className="flex items-start justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex flex-col gap-2">
            <p className="font-semibold">{text.noClassesTitle}</p>
            <p>{text.noClassesBody}</p>
            <Link href="/host/classes" className="font-medium text-blue-700 hover:underline">
              {text.goToClasses} →
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setGuardOpen(false)}
            className="text-amber-900 hover:underline"
            aria-label={text.dismiss}
          >
            ×
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.studentPublicId}
        isLoading={roster.isLoading || (roster.isFetching && !visibleResult)}
        emptyTitle={text.emptyTitle}
        emptyDescription={text.emptyDescription}
        rowActionsHeader={text.actions}
        searchPlaceholder={text.searchPlaceholder}
        clientSidePagination={false}
        toolbarActions={
          <>
            <Button
              variant="secondary"
              onClick={() => trySetManageMode("import")}
              disabled={tenantClassesLoading}
            >
              {text.import}
            </Button>
            <Button onClick={() => trySetManageMode("add")} disabled={tenantClassesLoading}>
              {text.add}
            </Button>
          </>
        }
        pagination={
          visibleResult ? (
            <PaginationControls
              meta={visibleResult.meta}
              onPageChange={handlePageChange}
              disabled={roster.isFetching}
              showPageSizeInput
              onPageSizeChange={(nextSize) => {
                setSize(nextSize);
                resetPage();
              }}
            />
          ) : undefined
        }
        rowActions={(row) => (
          <ActionMenu
            label={`${text.actions}: ${row.fullName}`}
            items={[
              {
                label: text.viewDetails,
                icon: EyeIcon,
                onSelect: () => setDetailsTarget(row),
              },
              { separator: true },
              {
                label: text.generatePassword,
                icon: LockIcon,
                disabled: generateCredentials.isPending,
                onSelect: () => setPasswordTarget(row),
              },
              row.status === "SUSPENDED"
                ? {
                    label: text.reactivate,
                    icon: CheckCircleIcon,
                    disabled: reactivate.isPending || suspend.isPending,
                    onSelect: () => reactivate.mutate(row.studentPublicId),
                  }
                : {
                    label: text.suspend,
                    icon: BanIcon,
                    danger: true,
                    disabled: reactivate.isPending || suspend.isPending,
                    onSelect: () => setStudentToSuspend(row),
                  },
            ]}
          />
        )}
      />

      <ConfirmDialog
        open={studentToSuspend !== null}
        title={text.confirmSuspendTitle}
        description={
          studentToSuspend ? text.confirmSuspendDescription(studentToSuspend.fullName) : ""
        }
        confirmLabel={text.confirm}
        cancelLabel={text.cancel}
        tone="danger"
        isConfirming={suspend.isPending}
        onConfirm={() => {
          if (!studentToSuspend) return;
          suspend.mutate(studentToSuspend.studentPublicId, {
            onSuccess: () => setStudentToSuspend(null),
          });
        }}
        onClose={() => setStudentToSuspend(null)}
      />

      <ConfirmDialog
        open={passwordTarget !== null}
        title={text.generatePasswordConfirmTitle}
        description={
          passwordTarget ? text.generatePasswordConfirmDescription(passwordTarget.fullName) : ""
        }
        confirmLabel={text.generatePasswordConfirm}
        cancelLabel={text.cancel}
        isConfirming={generateCredentials.isPending}
        onConfirm={() => {
          if (!passwordTarget) return;
          generateCredentials.mutate(passwordTarget.studentPublicId, {
            onSuccess: (result) => {
              setPasswordTarget(null);
              setCredentials(result);
            },
          });
        }}
        onClose={() => setPasswordTarget(null)}
      />

      <AccountDetailsModal
        open={detailsTarget !== null}
        account={detailsTarget ? toAccountDetails(detailsTarget) : null}
        onClose={() => setDetailsTarget(null)}
      />

      <GeneratedCredentialsModal
        open={credentials !== null}
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />

      {manageMode && (
        <ManageStudentsModal
          open
          initialMode={manageMode}
          onClose={() => {
            setManageMode(null);
            // If the modal was auto-opened from a deeplink, lock Program + Class
            // filters so the user does not accidentally add students to the wrong class.
            if (deeplink.wasPrefilledByDeeplink) {
              deeplink.setClassFilterLocked(true);
            }
          }}
        />
      )}
    </div>
  );
};

function toAccountDetails(row: StudentRosterRow): AccountDetails {
  return {
    publicId: row.studentPublicId,
    username: row.username,
    email: row.email,
    fullName: row.fullName,
    roles: ["STUDENT"],
    status: row.status,
    mustChangePassword: row.mustChangePassword,
    studentCode: row.studentCode,
    className: row.className,
    phone: row.phone,
  };
}
