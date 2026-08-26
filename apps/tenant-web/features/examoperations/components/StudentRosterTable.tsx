"use client";

import { useState, type ReactElement } from "react";
import { Alert, DataTable, Dropdown, LockIcon, XIcon, type DataTableColumn } from "@pte/ui";
import { useResetStudentPassword, useSessionRoster, useUnenroll, type RosterEntry } from "../api";
import { errorMessage } from "../errorMessage";
import { ResetStudentPasswordModal } from "./ResetStudentPasswordModal";

interface StudentRosterTableProps {
  sessionPublicId: string;
}

export const StudentRosterTable = ({ sessionPublicId }: StudentRosterTableProps): ReactElement => {
  const { data: roster, isLoading } = useSessionRoster(sessionPublicId);
  const unenrollMutation = useUnenroll(sessionPublicId);
  const [resetTarget, setResetTarget] = useState<RosterEntry | null>(null);
  const resetPassword = useResetStudentPassword(resetTarget?.student.publicId ?? "");

  const columns: DataTableColumn<RosterEntry>[] = [
    {
      key: "fullName",
      header: "Full name",
      cell: (entry) => <span className="font-medium text-gray-900">{entry.student.fullName}</span>,
    },
    { key: "email", header: "Email", cell: (entry) => entry.student.email },
    { key: "studentCode", header: "Student code", cell: (entry) => entry.student.studentCode ?? "-" },
    { key: "className", header: "Class", cell: (entry) => entry.student.className ?? "-" },
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
        emptyTitle="No students enrolled yet"
        rowActions={(entry) => (
          <Dropdown
            items={[
              {
                label: "Reset Password",
                icon: LockIcon,
                onSelect: () => setResetTarget(entry),
              },
              {
                label: "Remove from Exam",
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
