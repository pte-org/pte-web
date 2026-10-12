"use client";

import { useState, type ReactElement } from "react";
import {
  ActionMenu,
  Alert,
  DataTable,
  LockIcon,
  useLocale,
  XIcon,
  type DataTableColumn,
} from "@pte/ui";
import { useResetStudentPassword, useSessionRoster, useUnenroll, type RosterEntry } from "../api";
import { errorMessage } from "../errorMessage";
import { ResetStudentPasswordModal } from "./ResetStudentPasswordModal";
import {
  STUDENT_ROSTER_TABLE_TEXT,
  STUDENT_ROW_ACTIONS_TEXT,
  STUDENT_TABLE_HEADERS,
} from "./constants";

interface StudentRosterTableProps {
  sessionPublicId: string;
}

export const StudentRosterTable = ({ sessionPublicId }: StudentRosterTableProps): ReactElement => {
  const { t } = useLocale();
  const { data: roster, isLoading } = useSessionRoster(sessionPublicId);
  const unenrollMutation = useUnenroll(sessionPublicId);
  const [resetTarget, setResetTarget] = useState<RosterEntry | null>(null);
  const resetPassword = useResetStudentPassword(resetTarget?.student.publicId ?? "");
  const text = {
    fullName: t("tenant.studentRoster.fullName", STUDENT_TABLE_HEADERS.FULL_NAME),
    email: t("tenant.studentRoster.email", STUDENT_TABLE_HEADERS.EMAIL),
    studentCode: t("tenant.studentRoster.studentCode", STUDENT_TABLE_HEADERS.STUDENT_CODE),
    className: t("tenant.studentRoster.class", STUDENT_TABLE_HEADERS.CLASS_NAME),
    emptyTitle: t("tenant.studentRoster.empty", STUDENT_ROSTER_TABLE_TEXT.EMPTY_TITLE),
    emptyValue: t("common.emptyValue", STUDENT_ROSTER_TABLE_TEXT.EMPTY_VALUE),
    resetPassword: t("tenant.studentRoster.resetPassword", STUDENT_ROW_ACTIONS_TEXT.RESET_PASSWORD),
    removeFromExam: t(
      "tenant.studentRoster.removeFromExam",
      STUDENT_ROW_ACTIONS_TEXT.REMOVE_FROM_EXAM,
    ),
  };

  const columns: DataTableColumn<RosterEntry>[] = [
    {
      key: "fullName",
      header: text.fullName,
      cell: (entry) => (
        <span className="font-medium text-[var(--ink-primary)]">{entry.student.fullName}</span>
      ),
    },
    { key: "email", header: text.email, cell: (entry) => entry.student.email },
    {
      key: "studentCode",
      header: text.studentCode,
      cell: (entry) => entry.student.studentCode ?? text.emptyValue,
    },
    {
      key: "className",
      header: text.className,
      cell: (entry) => entry.student.className ?? text.emptyValue,
    },
  ];

  const unenrollErrorMessage = errorMessage(unenrollMutation.error);

  return (
    <div className="flex flex-col gap-3">
      {unenrollErrorMessage && <Alert tone="error">{unenrollErrorMessage}</Alert>}
      <DataTable
        columns={columns}
        rows={roster ?? []}
        getRowKey={(entry) => entry.enrollmentPublicId}
        isLoading={isLoading}
        emptyTitle={text.emptyTitle}
        rowActions={(entry) => (
          <ActionMenu
            items={[
              {
                label: text.resetPassword,
                icon: LockIcon,
                onSelect: () => setResetTarget(entry),
              },
              {
                label: text.removeFromExam,
                icon: XIcon,
                danger: true,
                onSelect: () => unenrollMutation.mutate(entry.enrollmentPublicId),
              },
            ]}
          />
        )}
      />

      <ResetStudentPasswordModal
        key={resetTarget ? `reset-${resetTarget.enrollmentPublicId}` : "reset-closed"}
        open={resetTarget !== null}
        onClose={() => {
          resetPassword.reset();
          setResetTarget(null);
        }}
        onSubmit={(newPassword) =>
          resetPassword.mutate(newPassword, { onSuccess: () => setResetTarget(null) })
        }
        error={errorMessage(resetPassword.error)}
        isSubmitting={resetPassword.isPending}
      />
    </div>
  );
};
