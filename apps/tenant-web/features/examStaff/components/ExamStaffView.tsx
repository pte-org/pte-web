"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { UserResponse } from "@pte/api-client";
import {
  Alert,
  ActionMenu,
  BanIcon,
  CheckCircleIcon,
  ConfirmDialog,
  EyeIcon,
  MailIcon,
  PageHeader,
  StatusBadge,
  Button,
} from "@pte/ui";
import { ChevronBothDirection } from "@tailgrids/icons";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAM_STAFF_ROLE_OPTIONS, EXAM_STAFF_SORT_OPTIONS, EXAM_STAFF_TEXT } from "../constants";
import { useAllExamStaff, useReactivateExamStaff, useSuspendExamStaff } from "../api";
import { AddExamStaffModal } from "./AddExamStaffModal";
import { ExamStaffTable, type ExamStaffTableColumn } from "./ExamStaffTable";
import {
  AccountDetailsModal,
  GeneratedCredentialsModal,
  useSendUserCredentials,
} from "@/features/userManagement";
import type { AccountDetails, GeneratedCredentials } from "@/features/userManagement";

type SortOptionValue = (typeof EXAM_STAFF_SORT_OPTIONS)[number]["value"];
type ColumnSort = "FULL_NAME" | "EMAIL";

const ROLE_LABELS: Record<string, string> = {
  PROCTOR: EXAM_STAFF_TEXT.proctor,
  EXAMINER: EXAM_STAFF_TEXT.examiner,
};

const ROLE_FILTER_OPTIONS = [
  { label: EXAM_STAFF_TEXT.allRoles, value: "" },
  ...EXAM_STAFF_ROLE_OPTIONS.map((option) => ({ ...option })),
];

const STATUS_OPTIONS = [
  { label: EXAM_STAFF_TEXT.allStatuses, value: "" },
  { label: EXAM_STAFF_TEXT.active, value: "ACTIVE" },
  { label: EXAM_STAFF_TEXT.suspended, value: "SUSPENDED" },
];

function sortOptionFor(value: SortOptionValue) {
  return (
    EXAM_STAFF_SORT_OPTIONS.find((option) => option.value === value) ?? EXAM_STAFF_SORT_OPTIONS[0]
  );
}

function roleLabel(user: UserResponse): string {
  return (
    user.roles
      .filter((role) => ROLE_LABELS[role])
      .map((role) => ROLE_LABELS[role])
      .join(", ") || "—"
  );
}

function SortHeader({ label, onSort }: { label: string; onSort?: () => void }): ReactElement {
  const content = (
    <>
      <span>{label}</span>
      <ChevronBothDirection className="size-3.5 text-text-100" aria-hidden="true" />
    </>
  );

  if (!onSort) {
    return <span className="inline-flex items-center gap-1.5">{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={onSort}
      className="inline-flex items-center gap-1.5 rounded-sm outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-input-primary-focus-border"
    >
      {content}
    </button>
  );
}

export const ExamStaffView = (): ReactElement => {
  const [sortOption, setSortOption] = useState<SortOptionValue>("CREATED_AT_DESC");
  const [addOpen, setAddOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<UserResponse | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<UserResponse | null>(null);
  const [emailTarget, setEmailTarget] = useState<UserResponse | null>(null);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);

  const selectedSort = sortOptionFor(sortOption);
  const staff = useAllExamStaff();
  const suspend = useSuspendExamStaff();
  const reactivate = useReactivateExamStaff();
  const sendCredentials = useSendUserCredentials();

  const rows = useMemo(() => {
    const nextRows = [...(staff.data ?? [])];
    if (sortOption === "CREATED_AT_DESC") return nextRows;

    const sortByEmail = sortOption.startsWith("EMAIL");
    const descending = sortOption.endsWith("_DESC");
    return nextRows.sort((left, right) => {
      const leftValue = sortByEmail ? left.email : left.fullName;
      const rightValue = sortByEmail ? right.email : right.fullName;
      const comparison = leftValue.localeCompare(rightValue, undefined, { sensitivity: "base" });
      return descending ? -comparison : comparison;
    });
  }, [sortOption, staff.data]);
  const queryError = errorMessage(staff.error);
  const mutationError = errorMessage(suspend.error ?? reactivate.error ?? sendCredentials.error);

  const setColumnSort = (sort: ColumnSort): void => {
    const current = selectedSort.sort === sort ? selectedSort.direction : undefined;
    const nextDirection = current === "ASC" ? "DESC" : "ASC";
    const nextOption = EXAM_STAFF_SORT_OPTIONS.find(
      (option) => option.sort === sort && option.direction === nextDirection,
    );
    if (!nextOption) return;
    setSortOption(nextOption.value);
  };

  const columns: ExamStaffTableColumn<UserResponse>[] = [
    {
      key: "fullName",
      label: EXAM_STAFF_TEXT.fullName,
      header: (
        <SortHeader label={EXAM_STAFF_TEXT.fullName} onSort={() => setColumnSort("FULL_NAME")} />
      ),
      filterAccessor: (user) => user.fullName,
      cell: (user) => <span className="font-medium text-text-primary">{user.fullName}</span>,
    },
    {
      key: "account",
      label: EXAM_STAFF_TEXT.account,
      header: <SortHeader label={EXAM_STAFF_TEXT.account} onSort={() => setColumnSort("EMAIL")} />,
      filterAccessor: (user) => user.username,
      cell: (user) => user.username,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "email",
      label: EXAM_STAFF_TEXT.email,
      header: <SortHeader label={EXAM_STAFF_TEXT.email} onSort={() => setColumnSort("EMAIL")} />,
      filterAccessor: (user) => user.email,
      cell: (user) => user.email,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "role",
      label: EXAM_STAFF_TEXT.role,
      header: <SortHeader label={EXAM_STAFF_TEXT.role} />,
      filterOptions: ROLE_FILTER_OPTIONS,
      filterAccessor: roleLabel,
      cell: roleLabel,
    },
    {
      key: "status",
      label: EXAM_STAFF_TEXT.status,
      header: <SortHeader label={EXAM_STAFF_TEXT.status} />,
      filterOptions: STATUS_OPTIONS,
      filterAccessor: (user) => user.status,
      cell: (user) => (
        <StatusBadge
          label={user.status === "ACTIVE" ? EXAM_STAFF_TEXT.active : EXAM_STAFF_TEXT.suspended}
          variant={user.status === "ACTIVE" ? "success" : "warning"}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={EXAM_STAFF_TEXT.title}
        actions={
          <Button variant="primary" appearance="fill" size="md" onClick={() => setAddOpen(true)}>
            {EXAM_STAFF_TEXT.addButton}
          </Button>
        }
      />

      {queryError && <Alert tone="error">{queryError || EXAM_STAFF_TEXT.loadFailed}</Alert>}
      {mutationError && <Alert tone="error">{mutationError}</Alert>}
      {staff.isFetching && staff.data && <Alert tone="info">{EXAM_STAFF_TEXT.syncing}</Alert>}

      <ExamStaffTable
        columns={columns}
        rows={rows}
        getRowKey={(user) => user.publicId}
        isLoading={staff.isLoading}
        emptyTitle={EXAM_STAFF_TEXT.emptyTitle}
        emptyDescription={EXAM_STAFF_TEXT.emptyDescription}
        rowActionsHeader={EXAM_STAFF_TEXT.actions}
        rowActions={(user) => (
          <ActionMenu
            label={`${EXAM_STAFF_TEXT.actions}: ${user.fullName}`}
            items={[
              {
                label: EXAM_STAFF_TEXT.viewDetails,
                icon: EyeIcon,
                onSelect: () => setDetailsTarget(user),
              },
              { separator: true },
              {
                label: EXAM_STAFF_TEXT.sendEmail,
                icon: MailIcon,
                disabled: !user.email || sendCredentials.isPending,
                onSelect: () => setEmailTarget(user),
              },
              user.status === "SUSPENDED"
                ? {
                    label: EXAM_STAFF_TEXT.reactivate,
                    icon: CheckCircleIcon,
                    disabled: reactivate.isPending || suspend.isPending,
                    onSelect: () => reactivate.mutate(user.publicId),
                  }
                : {
                    label: EXAM_STAFF_TEXT.suspend,
                    icon: BanIcon,
                    danger: true,
                    disabled: reactivate.isPending || suspend.isPending,
                    onSelect: () => setSuspendTarget(user),
                  },
            ]}
          />
        )}
        pageSizeLabel="Per page"
      />

      <ConfirmDialog
        open={suspendTarget !== null}
        title={EXAM_STAFF_TEXT.confirmSuspendTitle}
        description={
          suspendTarget ? EXAM_STAFF_TEXT.confirmSuspendDescription(suspendTarget.fullName) : ""
        }
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

      <ConfirmDialog
        open={emailTarget !== null}
        title={EXAM_STAFF_TEXT.sendEmailConfirmTitle}
        description={
          emailTarget ? EXAM_STAFF_TEXT.sendEmailConfirmDescription(emailTarget.fullName) : ""
        }
        confirmLabel={EXAM_STAFF_TEXT.sendEmailConfirm}
        cancelLabel={EXAM_STAFF_TEXT.cancel}
        isConfirming={sendCredentials.isPending}
        onConfirm={() => {
          if (!emailTarget) return;
          sendCredentials.mutate(emailTarget.publicId, {
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

      <AddExamStaffModal
        key={addOpen ? "exam-staff-open" : "exam-staff-closed"}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
};

function toAccountDetails(user: UserResponse): AccountDetails {
  return {
    publicId: user.publicId,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
    studentCode: user.studentCode,
    className: user.className,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
  };
}
