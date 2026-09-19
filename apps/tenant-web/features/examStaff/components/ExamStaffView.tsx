"use client";

import { useEffect, useState, type ReactElement } from "react";
import type { ExamStaffRoleFilter, UserListDirection, UserListSort, UserResponse, UserStatusFilter } from "@pte/api-client";
import {
  Alert,
  Button,
  ConfirmDialog,
  DataTable,
  Input,
  PageHeader,
  PaginationControls,
  Select,
  StatusBadge,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  EXAM_STAFF_PAGE_SIZE_OPTIONS,
  EXAM_STAFF_ROLE_OPTIONS,
  EXAM_STAFF_SORT_OPTIONS,
  EXAM_STAFF_TEXT,
} from "../constants";
import {
  useExamStaff,
  useReactivateExamStaff,
  useSuspendExamStaff,
} from "../api";
import { AddExamStaffModal } from "./AddExamStaffModal";

const DEFAULT_PAGE_SIZE = 20;
const DEBOUNCE_MS = 250;

type SortOptionValue = (typeof EXAM_STAFF_SORT_OPTIONS)[number]["value"];

const ROLE_LABELS: Record<string, string> = {
  PROCTOR: EXAM_STAFF_TEXT.proctor,
  EXAMINER: EXAM_STAFF_TEXT.examiner,
};

const ROLE_FILTER_OPTIONS = [
  { label: EXAM_STAFF_TEXT.allRoles, value: "ALL" },
  ...EXAM_STAFF_ROLE_OPTIONS.map((option) => ({ ...option })),
];

const STATUS_OPTIONS = [
  { label: EXAM_STAFF_TEXT.allStatuses, value: "ALL" },
  { label: EXAM_STAFF_TEXT.active, value: "ACTIVE" },
  { label: EXAM_STAFF_TEXT.suspended, value: "SUSPENDED" },
];

function sortOptionFor(value: SortOptionValue) {
  return EXAM_STAFF_SORT_OPTIONS.find((option) => option.value === value) ?? EXAM_STAFF_SORT_OPTIONS[0];
}

function roleLabel(user: UserResponse): string {
  return user.roles.filter((role) => ROLE_LABELS[role]).map((role) => ROLE_LABELS[role]).join(", ") || "—";
}

export const ExamStaffView = (): ReactElement => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [role, setRole] = useState<ExamStaffRoleFilter>("ALL");
  const [status, setStatus] = useState<UserStatusFilter>("ALL");
  const [sortOption, setSortOption] = useState<SortOptionValue>("CREATED_AT_DESC");
  const [addOpen, setAddOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<UserResponse | null>(null);
  const [keepPreviousRows, setKeepPreviousRows] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(input);
      setPage(0);
      setKeepPreviousRows(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [input]);

  const selectedSort = sortOptionFor(sortOption);
  const staff = useExamStaff({
    page,
    size,
    search,
    role,
    status,
    sort: selectedSort.sort as UserListSort,
    direction: selectedSort.direction as UserListDirection,
  });
  const suspend = useSuspendExamStaff();
  const reactivate = useReactivateExamStaff();
  const isNewFilterPending = staff.isPlaceholderData && !keepPreviousRows;
  const visibleResult = isNewFilterPending ? undefined : staff.data;
  const rows = visibleResult?.data ?? [];
  const queryError = errorMessage(staff.error);
  const mutationError = errorMessage(suspend.error ?? reactivate.error);

  const resetPage = (): void => {
    setPage(0);
    setKeepPreviousRows(false);
  };

  const columns: DataTableColumn<UserResponse>[] = [
    { key: "fullName", header: EXAM_STAFF_TEXT.fullName, cell: (user) => <span className="font-medium text-gray-900">{user.fullName}</span> },
    { key: "email", header: EXAM_STAFF_TEXT.email, cell: (user) => user.email },
    { key: "role", header: EXAM_STAFF_TEXT.role, cell: roleLabel },
    {
      key: "status",
      header: EXAM_STAFF_TEXT.status,
      cell: (user) => <StatusBadge label={user.status === "ACTIVE" ? EXAM_STAFF_TEXT.active : EXAM_STAFF_TEXT.suspended} variant={user.status === "ACTIVE" ? "success" : "warning"} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={EXAM_STAFF_TEXT.title}
        subtitle={EXAM_STAFF_TEXT.subtitle}
        actions={<Button onClick={() => setAddOpen(true)}>{EXAM_STAFF_TEXT.addButton}</Button>}
      />

      <div className="grid gap-3 lg:grid-cols-4">
        <Input
          aria-label={EXAM_STAFF_TEXT.searchPlaceholder}
          placeholder={EXAM_STAFF_TEXT.searchPlaceholder}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <Select
          label={EXAM_STAFF_TEXT.roleLabel}
          options={ROLE_FILTER_OPTIONS}
          value={role}
          onChange={(event) => {
            setRole(event.target.value as ExamStaffRoleFilter);
            resetPage();
          }}
        />
        <Select
          label={EXAM_STAFF_TEXT.statusLabel}
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as UserStatusFilter);
            resetPage();
          }}
        />
        <Select
          label={EXAM_STAFF_TEXT.sortLabel}
          options={EXAM_STAFF_SORT_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
          value={sortOption}
          onChange={(event) => {
            setSortOption(event.target.value as SortOptionValue);
            resetPage();
          }}
        />
      </div>

      {queryError && <Alert tone="error">{queryError || EXAM_STAFF_TEXT.loadFailed}</Alert>}
      {mutationError && <Alert tone="error">{mutationError}</Alert>}
      {staff.isFetching && visibleResult && <Alert tone="info">{EXAM_STAFF_TEXT.syncing}</Alert>}

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(user) => user.publicId}
        isLoading={staff.isLoading || (staff.isFetching && !visibleResult)}
        emptyTitle={EXAM_STAFF_TEXT.emptyTitle}
        emptyDescription={EXAM_STAFF_TEXT.emptyDescription}
        rowActionsHeader={EXAM_STAFF_TEXT.actions}
        rowActions={(user) =>
          user.status === "SUSPENDED" ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={reactivate.isPending || suspend.isPending}
              onClick={() => reactivate.mutate(user.publicId)}
            >
              {EXAM_STAFF_TEXT.reactivate}
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              disabled={reactivate.isPending || suspend.isPending}
              onClick={() => setSuspendTarget(user)}
            >
              {EXAM_STAFF_TEXT.suspend}
            </Button>
          )
        }
      />

      {visibleResult && (
        <PaginationControls
          meta={visibleResult.meta}
          onPageChange={(nextPage) => {
            setKeepPreviousRows(true);
            setPage(nextPage);
          }}
          disabled={staff.isFetching}
          showPageSizeSelector
          pageSizeOptions={EXAM_STAFF_PAGE_SIZE_OPTIONS}
          onPageSizeChange={(nextSize) => {
            setSize(nextSize);
            resetPage();
          }}
          showFirstLast
          pageSizeLabel={EXAM_STAFF_TEXT.pageSizeLabel}
          firstLabel={EXAM_STAFF_TEXT.firstPage}
          lastLabel={EXAM_STAFF_TEXT.lastPage}
          totalItemsLabel={EXAM_STAFF_TEXT.totalItems(visibleResult.meta.totalElements)}
        />
      )}

      <ConfirmDialog
        open={suspendTarget !== null}
        title={EXAM_STAFF_TEXT.confirmSuspendTitle}
        description={suspendTarget ? EXAM_STAFF_TEXT.confirmSuspendDescription(suspendTarget.fullName) : ""}
        confirmLabel={EXAM_STAFF_TEXT.confirm}
        cancelLabel={EXAM_STAFF_TEXT.cancel}
        tone="danger"
        isConfirming={suspend.isPending}
        onConfirm={() => {
          if (!suspendTarget) return;
          suspend.mutate(suspendTarget.publicId, { onSuccess: () => setSuspendTarget(null) });
        }}
        onClose={() => setSuspendTarget(null)}
      />

      <AddExamStaffModal
        key={addOpen ? "exam-staff-open" : "exam-staff-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
};
