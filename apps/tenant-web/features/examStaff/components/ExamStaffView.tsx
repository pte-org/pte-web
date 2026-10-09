"use client";

import { useState, type ReactElement } from "react";
import type { UserResponse } from "@pte/api-client";
import {
  Alert,
  ActionMenu,
  BanIcon,
  CheckCircleIcon,
  ConfirmDialog,
  EyeIcon,
  MailIcon,
  StatusBadge,
  Button,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAM_STAFF_ROLE_OPTIONS, EXAM_STAFF_TEXT } from "../constants";
import { useAllExamStaff, useReactivateExamStaff, useSuspendExamStaff } from "../api";
import { AddExamStaffModal } from "./AddExamStaffModal";
import { ExamStaffTable, type ExamStaffTableColumn } from "./ExamStaffTable";
import {
  AccountDetailsModal,
  GeneratedCredentialsModal,
  useSendUserCredentials,
} from "@/features/userManagement";
import type { AccountDetails, GeneratedCredentials } from "@/features/userManagement";

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

function roleLabel(user: UserResponse): string {
  return (
    user.roles
      .filter((role) => ROLE_LABELS[role])
      .map((role) => ROLE_LABELS[role])
      .join(", ") || "—"
  );
}

export const ExamStaffView = (): ReactElement => {
  const [addOpen, setAddOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<UserResponse | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<UserResponse | null>(null);
  const [emailTarget, setEmailTarget] = useState<UserResponse | null>(null);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);

  const staff = useAllExamStaff();
  const suspend = useSuspendExamStaff();
  const reactivate = useReactivateExamStaff();
  const sendCredentials = useSendUserCredentials();

  const rows = staff.data ?? [];
  const queryError = errorMessage(staff.error);
  const mutationError = errorMessage(suspend.error ?? reactivate.error ?? sendCredentials.error);

  const columns: ExamStaffTableColumn<UserResponse>[] = [
    {
      key: "fullName",
      label: EXAM_STAFF_TEXT.fullName,
      header: EXAM_STAFF_TEXT.fullName,
      filterAccessor: (user) => user.fullName,
      cell: (user) => <span className="font-medium text-text-primary">{user.fullName}</span>,
    },
    {
      key: "account",
      label: EXAM_STAFF_TEXT.account,
      header: EXAM_STAFF_TEXT.account,
      filterAccessor: (user) => user.username,
      cell: (user) => user.username,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "email",
      label: EXAM_STAFF_TEXT.email,
      header: EXAM_STAFF_TEXT.email,
      filterAccessor: (user) => user.email,
      cell: (user) => user.email,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "role",
      label: EXAM_STAFF_TEXT.role,
      header: EXAM_STAFF_TEXT.role,
      filterOptions: ROLE_FILTER_OPTIONS,
      filterAccessor: roleLabel,
      cell: roleLabel,
    },
    {
      key: "status",
      label: EXAM_STAFF_TEXT.status,
      header: EXAM_STAFF_TEXT.status,
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
        toolbarActions={
          <Button variant="primary" appearance="fill" size="md" onClick={() => setAddOpen(true)}>
            {EXAM_STAFF_TEXT.addButton}
          </Button>
        }
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
