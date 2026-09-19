"use client";

import { useEffect, useState, type ReactElement } from "react";
import type {
  StudentRosterAssignmentStatus,
  StudentRosterDirection,
  StudentRosterRow,
  StudentRosterSort,
} from "@pte/api-client";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Button,
  CheckCircleIcon,
  ConfirmDialog,
  DataTable,
  EyeIcon,
  Input,
  MailIcon,
  PageHeader,
  PaginationControls,
  Select,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { useClasses } from "@/features/classes/api";
import { useMyOrganizations, usePrograms } from "@/features/programs/api";
import {
  STUDENT_ROSTER_FILTER_TEXT,
  STUDENT_ROSTER_PAGE_SIZE_OPTIONS,
  STUDENT_ROSTER_SORT_OPTIONS,
  STUDENT_SEARCH_ACTIONS_TEXT,
  STUDENT_SEARCH_TABLE_HEADERS,
  STUDENT_SEARCH_TEXT,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_VARIANT,
} from "../constants";
import { useReactivateStudent, useStudentRoster, useSuspendStudent } from "../api";
import { ManageStudentsModal } from "./ManageStudentsModal";
import {
  AccountDetailsModal,
  GeneratedCredentialsModal,
  useSendUserCredentials,
} from "@/features/userManagement";
import type { AccountDetails, GeneratedCredentials } from "@/features/userManagement";

const DEBOUNCE_MS = 250;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_ASSIGNMENT_STATUS: StudentRosterAssignmentStatus = "ALL";

type SortOptionValue = (typeof STUDENT_ROSTER_SORT_OPTIONS)[number]["value"];

function sortOptionFor(value: SortOptionValue) {
  return (
    STUDENT_ROSTER_SORT_OPTIONS.find((option) => option.value === value) ??
    STUDENT_ROSTER_SORT_OPTIONS[0]
  );
}

export const StudentSearchView = (): ReactElement => {
  const labels = useOrgLabels();
  const [input, setInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedOrganizationPublicId, setSelectedOrganizationPublicId] = useState("");
  const [programPublicId, setProgramPublicId] = useState("");
  const [classPublicId, setClassPublicId] = useState("");
  const [assignmentStatus, setAssignmentStatus] =
    useState<StudentRosterAssignmentStatus>(DEFAULT_ASSIGNMENT_STATUS);
  const [sortOption, setSortOption] = useState<SortOptionValue>("CREATED_AT_DESC");
  const [manageMode, setManageMode] = useState<"add" | "import" | null>(null);
  const [studentToSuspend, setStudentToSuspend] = useState<StudentRosterRow | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<StudentRosterRow | null>(null);
  const [emailTarget, setEmailTarget] = useState<StudentRosterRow | null>(null);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const [keepPreviousRows, setKeepPreviousRows] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(input);
      setPage(0);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [input]);

  const { data: organizations } = useMyOrganizations();
  const organizationPublicId = selectedOrganizationPublicId || organizations?.[0]?.publicId || "";
  const { data: programs, isLoading: programsLoading } = usePrograms(organizationPublicId);
  const { data: classes, isLoading: classesLoading } = useClasses(
    organizationPublicId,
    programPublicId,
  );
  const selectedSort = sortOptionFor(sortOption);
  const rosterQuery = {
    page,
    size,
    search: debouncedQuery,
    programPublicId: programPublicId || undefined,
    classPublicId: classPublicId || undefined,
    assignmentStatus,
    sort: selectedSort.sort as StudentRosterSort,
    direction: selectedSort.direction as StudentRosterDirection,
  };
  const roster = useStudentRoster(rosterQuery);
  const suspend = useSuspendStudent();
  const reactivate = useReactivateStudent();
  const sendCredentials = useSendUserCredentials();
  const hasOrganizationSelector = (organizations?.length ?? 0) > 1;
  const filterGridClass = hasOrganizationSelector
    ? "grid gap-3 lg:grid-cols-3"
    : "grid gap-3 lg:grid-cols-6";
  const programGridClass = hasOrganizationSelector ? "lg:col-span-1" : "lg:col-span-3";
  const filterGridItemClass = hasOrganizationSelector ? "lg:col-span-1" : "lg:col-span-2";

  const isNewFilterPending = roster.isPlaceholderData && !keepPreviousRows;
  const visibleResult = isNewFilterPending ? undefined : roster.data;
  const rows = visibleResult?.data ?? [];
  const queryError = errorMessage(roster.error);
  const mutationError = errorMessage(suspend.error ?? reactivate.error ?? sendCredentials.error);

  const resetPage = (): void => {
    setKeepPreviousRows(false);
    setPage(0);
  };

  const handlePageChange = (nextPage: number): void => {
    setKeepPreviousRows(true);
    setPage(nextPage);
  };

  const columns: DataTableColumn<StudentRosterRow>[] = [
    {
      key: "name",
      header: STUDENT_SEARCH_TABLE_HEADERS.NAME,
      cell: (row) => <span className="font-medium text-gray-900">{row.fullName}</span>,
    },
    {
      key: "code",
      header: STUDENT_SEARCH_TABLE_HEADERS.CODE,
      cell: (row) => row.studentCode ?? "—",
    },
    { key: "email", header: STUDENT_SEARCH_TABLE_HEADERS.EMAIL, cell: (row) => row.email },
    { key: "phone", header: STUDENT_SEARCH_TABLE_HEADERS.PHONE, cell: (row) => row.phone ?? "—" },
    {
      key: "class",
      header: labels.class,
      cell: (row) => row.className ?? STUDENT_SEARCH_TEXT.unassigned,
    },
    {
      key: "program",
      header: labels.program,
      cell: (row) => row.programName ?? "—",
    },
    {
      key: "status",
      header: STUDENT_SEARCH_TABLE_HEADERS.STATUS,
      cell: (row) => (
        <StatusBadge
          label={STUDENT_STATUS_LABELS[row.status]}
          variant={STUDENT_STATUS_VARIANT[row.status]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={STUDENT_SEARCH_TEXT.title}
        subtitle={STUDENT_SEARCH_TEXT.subtitle}
        actions={
          <>
            <Button variant="secondary" onClick={() => setManageMode("import")}>
              {STUDENT_SEARCH_ACTIONS_TEXT.import}
            </Button>
            <Button onClick={() => setManageMode("add")}>{STUDENT_SEARCH_ACTIONS_TEXT.add}</Button>
          </>
        }
      />

      <div className={filterGridClass}>
        <div
          className={hasOrganizationSelector ? "lg:col-span-1 lg:pt-5" : "lg:col-span-3 lg:pt-5"}
        >
          <Input
            aria-label={STUDENT_ROSTER_FILTER_TEXT.searchPlaceholder}
            placeholder={STUDENT_ROSTER_FILTER_TEXT.searchPlaceholder}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        {organizations && organizations.length > 1 && (
          <div className={filterGridItemClass}>
            <Select
              label={STUDENT_ROSTER_FILTER_TEXT.organizationLabel}
              options={organizations.map((organization) => ({
                label: organization.name,
                value: organization.publicId,
              }))}
              value={organizationPublicId}
              onChange={(event) => {
                setSelectedOrganizationPublicId(event.target.value);
                setProgramPublicId("");
                setClassPublicId("");
                resetPage();
              }}
            />
          </div>
        )}
        <div className={programGridClass}>
          <Select
            label={labels.program}
            placeholder={STUDENT_ROSTER_FILTER_TEXT.programPlaceholder}
            options={(programs ?? []).map((program) => ({
              label: program.name,
              value: program.publicId,
            }))}
            value={programPublicId}
            disabled={programsLoading || !organizationPublicId}
            onChange={(event) => {
              setProgramPublicId(event.target.value);
              setClassPublicId("");
              resetPage();
            }}
          />
        </div>
        <div className={filterGridItemClass}>
          <Select
            label={labels.class}
            placeholder={
              programPublicId
                ? STUDENT_ROSTER_FILTER_TEXT.classPlaceholder
                : STUDENT_ROSTER_FILTER_TEXT.noClasses
            }
            options={(classes ?? []).map((studentClass) => ({
              label: studentClass.name,
              value: studentClass.publicId,
            }))}
            value={classPublicId}
            disabled={!programPublicId || classesLoading}
            onChange={(event) => {
              setClassPublicId(event.target.value);
              resetPage();
            }}
          />
        </div>
        <div className={filterGridItemClass}>
          <Select
            label={STUDENT_ROSTER_FILTER_TEXT.assignmentLabel}
            options={[
              { label: STUDENT_ROSTER_FILTER_TEXT.assignmentAll, value: "ALL" },
              { label: STUDENT_ROSTER_FILTER_TEXT.assignmentAssigned, value: "ASSIGNED" },
              { label: STUDENT_ROSTER_FILTER_TEXT.assignmentUnassigned, value: "UNASSIGNED" },
            ]}
            value={assignmentStatus}
            onChange={(event) => {
              setAssignmentStatus(event.target.value as StudentRosterAssignmentStatus);
              resetPage();
            }}
          />
        </div>
        <div className={filterGridItemClass}>
          <Select
            label={STUDENT_ROSTER_FILTER_TEXT.sortLabel}
            options={STUDENT_ROSTER_SORT_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            value={sortOption}
            onChange={(event) => {
              setSortOption(event.target.value as SortOptionValue);
              resetPage();
            }}
          />
        </div>
      </div>

      {queryError && (
        <Alert tone="error">{queryError || STUDENT_ROSTER_FILTER_TEXT.loadFailed}</Alert>
      )}
      {mutationError && <Alert tone="error">{mutationError}</Alert>}
      {roster.isFetching && visibleResult && (
        <Alert tone="info">{STUDENT_ROSTER_FILTER_TEXT.syncing}</Alert>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.studentPublicId}
        isLoading={roster.isLoading || (roster.isFetching && !visibleResult)}
        emptyTitle={STUDENT_SEARCH_TEXT.emptyTitle}
        emptyDescription={STUDENT_ROSTER_FILTER_TEXT.emptyDescription}
        rowActionsHeader={STUDENT_ROSTER_FILTER_TEXT.actions}
        rowActions={(row) => (
          <ActionMenu
            label={`${STUDENT_ROSTER_FILTER_TEXT.actions}: ${row.fullName}`}
            items={[
              {
                label: STUDENT_ROSTER_FILTER_TEXT.viewDetails,
                icon: EyeIcon,
                onSelect: () => setDetailsTarget(row),
              },
              { separator: true },
              {
                label: STUDENT_ROSTER_FILTER_TEXT.sendEmail,
                icon: MailIcon,
                disabled: !row.email || sendCredentials.isPending,
                onSelect: () => setEmailTarget(row),
              },
              row.status === "SUSPENDED"
                ? {
                    label: STUDENT_ROSTER_FILTER_TEXT.reactivate,
                    icon: CheckCircleIcon,
                    disabled: reactivate.isPending || suspend.isPending,
                    onSelect: () => reactivate.mutate(row.studentPublicId),
                  }
                : {
                    label: STUDENT_ROSTER_FILTER_TEXT.suspend,
                    icon: BanIcon,
                    danger: true,
                    disabled: reactivate.isPending || suspend.isPending,
                    onSelect: () => setStudentToSuspend(row),
                  },
            ]}
          />
        )}
      />

      {visibleResult && (
        <PaginationControls
          meta={visibleResult.meta}
          onPageChange={handlePageChange}
          disabled={roster.isFetching}
          showPageSizeSelector
          pageSizeOptions={STUDENT_ROSTER_PAGE_SIZE_OPTIONS}
          onPageSizeChange={(nextSize) => {
            setSize(nextSize);
            resetPage();
          }}
          showFirstLast
          pageSizeLabel={STUDENT_ROSTER_FILTER_TEXT.pageSizeLabel}
          firstLabel={STUDENT_ROSTER_FILTER_TEXT.firstPage}
          lastLabel={STUDENT_ROSTER_FILTER_TEXT.lastPage}
          totalItemsLabel={STUDENT_ROSTER_FILTER_TEXT.totalItems(visibleResult.meta.totalElements)}
        />
      )}

      <ConfirmDialog
        open={studentToSuspend !== null}
        title={STUDENT_ROSTER_FILTER_TEXT.confirmSuspendTitle}
        description={
          studentToSuspend
            ? STUDENT_ROSTER_FILTER_TEXT.confirmSuspendDescription(studentToSuspend.fullName)
            : ""
        }
        confirmLabel={STUDENT_ROSTER_FILTER_TEXT.confirm}
        cancelLabel={STUDENT_ROSTER_FILTER_TEXT.cancel}
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
        open={emailTarget !== null}
        title={STUDENT_ROSTER_FILTER_TEXT.sendEmailConfirmTitle}
        description={
          emailTarget
            ? STUDENT_ROSTER_FILTER_TEXT.sendEmailConfirmDescription(emailTarget.fullName)
            : ""
        }
        confirmLabel={STUDENT_ROSTER_FILTER_TEXT.sendEmailConfirm}
        cancelLabel={STUDENT_ROSTER_FILTER_TEXT.cancel}
        isConfirming={sendCredentials.isPending}
        onConfirm={() => {
          if (!emailTarget) return;
          sendCredentials.mutate(emailTarget.studentPublicId, {
            onSuccess: (result) => {
              setEmailTarget(null);
              setCredentials(result);
            },
          });
        }}
        onClose={() => setEmailTarget(null)}
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
        <ManageStudentsModal open initialMode={manageMode} onClose={() => setManageMode(null)} />
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
