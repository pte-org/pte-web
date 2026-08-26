"use client";

import { useState, type ReactElement } from "react";
import type { UserResponse } from "@pte/api-client";
import { Alert, DataTable, Dropdown, LockIcon, type DataTableColumn } from "@pte/ui";
import { LEARNERS_OVERVIEW_TEXT } from "./constants";
import { useResetStudentPassword, useTenantStudents } from "../api";
import { errorMessage } from "../errorMessage";
import { ResetStudentPasswordModal } from "./ResetStudentPasswordModal";

const T = LEARNERS_OVERVIEW_TEXT;

export const LearnersOverview = (): ReactElement => {
  const studentsQuery = useTenantStudents();
  const [resetTarget, setResetTarget] = useState<UserResponse | null>(null);
  const resetPassword = useResetStudentPassword(resetTarget?.publicId ?? "");

  const columns: DataTableColumn<UserResponse>[] = [
    {
      key: "fullName",
      header: "Full name",
      cell: (student) => <span className="font-medium text-gray-900">{student.fullName}</span>,
    },
    { key: "email", header: "Email", cell: (student) => student.email },
    { key: "studentCode", header: "Student code", cell: (student) => student.studentCode ?? "-" },
    { key: "className", header: "Class", cell: (student) => student.className ?? "-" },
    { key: "phone", header: "Phone", cell: (student) => student.phone ?? "-" },
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-900">{T.TITLE}</h2>
        <p className="text-sm text-gray-600">{T.SUBTITLE}</p>
      </div>

      {studentsQuery.error && (
        <Alert tone="error" title={T.UNABLE_TO_LOAD}>
          {errorMessage(studentsQuery.error) ?? "Please try again."}
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={studentsQuery.data ?? []}
        getRowKey={(student) => student.publicId}
        isLoading={studentsQuery.isLoading}
        emptyTitle={T.EMPTY_TITLE}
        emptyDescription={T.EMPTY_TEXT}
        rowActions={(student) => (
          <Dropdown
            items={[
              {
                label: "Reset Password",
                icon: LockIcon,
                onSelect: () => setResetTarget(student),
              },
            ]}
          />
        )}
      />

      <ResetStudentPasswordModal
        key={resetTarget ? `reset-${resetTarget.publicId}` : "reset-closed"}
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
    </section>
  );
};
