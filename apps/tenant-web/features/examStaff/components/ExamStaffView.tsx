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
  useLocale,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAM_STAFF_TEXT } from "../constants";
import { useAllExamStaff, useReactivateExamStaff, useSuspendExamStaff } from "../api";
import { AddExamStaffModal } from "./AddExamStaffModal";
import { ExamStaffTable, type ExamStaffTableColumn } from "./ExamStaffTable";
import {
  AccountDetailsModal,
  GeneratedCredentialsModal,
  useSendUserCredentials,
} from "@/features/userManagement";
import type { AccountDetails, GeneratedCredentials } from "@/features/userManagement";

function roleLabel(user: UserResponse, roleLabels: Record<string, string>): string {
  return (
    user.roles
      .filter((role) => roleLabels[role])
      .map((role) => roleLabels[role])
      .join(", ") || "—"
  );
}

export const ExamStaffView = (): ReactElement => {
  const { t } = useLocale();
  const text = {
    addButton: t("tenant.examStaff.add", EXAM_STAFF_TEXT.addButton),
    fullName: t("tenant.examStaff.fullName", EXAM_STAFF_TEXT.fullName),
    account: t("tenant.examStaff.account", EXAM_STAFF_TEXT.account),
    email: t("tenant.examStaff.email", EXAM_STAFF_TEXT.email),
    role: t("tenant.examStaff.role", EXAM_STAFF_TEXT.role),
    status: t("tenant.examStaff.status", EXAM_STAFF_TEXT.status),
    actions: t("tenant.examStaff.actions", EXAM_STAFF_TEXT.actions),
    allRoles: t("tenant.examStaff.allRoles", EXAM_STAFF_TEXT.allRoles),
    allStatuses: t("tenant.examStaff.allStatuses", EXAM_STAFF_TEXT.allStatuses),
    proctor: t("tenant.examStaff.proctor", EXAM_STAFF_TEXT.proctor),
    examiner: t("tenant.examStaff.examiner", EXAM_STAFF_TEXT.examiner),
    active: t("tenant.examStaff.active", EXAM_STAFF_TEXT.active),
    suspended: t("tenant.examStaff.suspended", EXAM_STAFF_TEXT.suspended),
    viewDetails: t("tenant.examStaff.viewDetails", EXAM_STAFF_TEXT.viewDetails),
    sendEmail: t("tenant.examStaff.sendEmail", EXAM_STAFF_TEXT.sendEmail),
    reactivate: t("tenant.examStaff.reactivate", EXAM_STAFF_TEXT.reactivate),
    suspend: t("tenant.examStaff.suspend", EXAM_STAFF_TEXT.suspend),
    emptyTitle: t("tenant.examStaff.empty", EXAM_STAFF_TEXT.emptyTitle),
    emptyDescription: t("tenant.examStaff.emptyDescription", EXAM_STAFF_TEXT.emptyDescription),
    syncing: t("tenant.examStaff.syncing", EXAM_STAFF_TEXT.syncing),
    confirmSuspendTitle: t(
      "tenant.examStaff.confirmSuspendTitle",
      EXAM_STAFF_TEXT.confirmSuspendTitle,
    ),
    confirmSuspendDescription: (name: string) =>
      t(
        "tenant.examStaff.confirmSuspendDescription",
        EXAM_STAFF_TEXT.confirmSuspendDescription(name),
        { name },
      ),
    confirm: t("tenant.examStaff.confirmSuspend", EXAM_STAFF_TEXT.confirm),
    cancel: t("tenant.examStaff.cancel", EXAM_STAFF_TEXT.cancel),
    sendEmailConfirmTitle: t(
      "tenant.examStaff.sendEmailConfirmTitle",
      EXAM_STAFF_TEXT.sendEmailConfirmTitle,
    ),
    sendEmailConfirmDescription: (name: string) =>
      t(
        "tenant.examStaff.sendEmailConfirmDescription",
        EXAM_STAFF_TEXT.sendEmailConfirmDescription(name),
        { name },
      ),
    sendEmailConfirm: t("tenant.examStaff.sendEmailConfirm", EXAM_STAFF_TEXT.sendEmailConfirm),
  };
  const roleLabels = { PROCTOR: text.proctor, EXAMINER: text.examiner };
  const roleFilterOptions = [
    { label: text.allRoles, value: "" },
    { label: text.proctor, value: "PROCTOR" },
    { label: text.examiner, value: "EXAMINER" },
  ];
  const statusOptions = [
    { label: text.allStatuses, value: "" },
    { label: text.active, value: "ACTIVE" },
    { label: text.suspended, value: "SUSPENDED" },
  ];
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
      label: text.fullName,
      header: text.fullName,
      filterAccessor: (user) => user.fullName,
      cell: (user) => <span className="font-medium text-text-primary">{user.fullName}</span>,
    },
    {
      key: "account",
      label: text.account,
      header: text.account,
      filterAccessor: (user) => user.username,
      cell: (user) => user.username,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "email",
      label: text.email,
      header: text.email,
      filterAccessor: (user) => user.email,
      cell: (user) => user.email,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "role",
      label: text.role,
      header: text.role,
      filterOptions: roleFilterOptions,
      filterAccessor: (user) => roleLabel(user, roleLabels),
      cell: (user) => roleLabel(user, roleLabels),
    },
    {
      key: "status",
      label: text.status,
      header: text.status,
      filterOptions: statusOptions,
      filterAccessor: (user) => user.status,
      cell: (user) => (
        <StatusBadge
          label={user.status === "ACTIVE" ? text.active : text.suspended}
          variant={user.status === "ACTIVE" ? "success" : "warning"}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {queryError && <Alert tone="error">{queryError || EXAM_STAFF_TEXT.loadFailed}</Alert>}
      {mutationError && <Alert tone="error">{mutationError}</Alert>}
      {staff.isFetching && staff.data && <Alert tone="info">{text.syncing}</Alert>}

      <ExamStaffTable
        columns={columns}
        rows={rows}
        getRowKey={(user) => user.publicId}
        isLoading={staff.isLoading}
        emptyTitle={text.emptyTitle}
        emptyDescription={text.emptyDescription}
        rowActionsHeader={text.actions}
        toolbarActions={
          <Button variant="primary" appearance="fill" size="md" onClick={() => setAddOpen(true)}>
            {text.addButton}
          </Button>
        }
        rowActions={(user) => (
          <ActionMenu
            label={`${text.actions}: ${user.fullName}`}
            items={[
              {
                label: text.viewDetails,
                icon: EyeIcon,
                onSelect: () => setDetailsTarget(user),
              },
              { separator: true },
              {
                label: text.sendEmail,
                icon: MailIcon,
                disabled: !user.email || sendCredentials.isPending,
                onSelect: () => setEmailTarget(user),
              },
              user.status === "SUSPENDED"
                ? {
                    label: text.reactivate,
                    icon: CheckCircleIcon,
                    disabled: reactivate.isPending || suspend.isPending,
                    onSelect: () => reactivate.mutate(user.publicId),
                  }
                : {
                    label: text.suspend,
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
        title={text.confirmSuspendTitle}
        description={suspendTarget ? text.confirmSuspendDescription(suspendTarget.fullName) : ""}
        confirmLabel={text.confirm}
        cancelLabel={text.cancel}
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
        title={text.sendEmailConfirmTitle}
        description={emailTarget ? text.sendEmailConfirmDescription(emailTarget.fullName) : ""}
        confirmLabel={text.sendEmailConfirm}
        cancelLabel={text.cancel}
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
