"use client";

import type { ReactElement, ReactNode } from "react";
import { Button, ErrorState, LoadingState } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import {
  useProctorWorkspaceText,
  type ProctorWorkspaceText,
} from "../hooks/useProctorWorkspaceText";

const roleLabel = (role: string, text: ProctorWorkspaceText): string => {
  switch (role) {
    case "HOST_ADMIN":
      return text.accountRoleHostAdmin;
    case "ACADEMIC_MANAGER":
      return text.accountRoleAcademicManager;
    case "ACADEMIC_STAFF":
      return text.accountRoleAcademicStaff;
    case "PROCTOR":
      return text.accountRoleProctor;
    case "EXAMINER":
      return text.accountRoleExaminer;
    case "STUDENT":
      return text.accountRoleStudent;
    default:
      return role;
  }
};

const statusLabel = (status: string, text: ProctorWorkspaceText): string => {
  switch (status) {
    case "ACTIVE":
      return text.accountStatusActive;
    case "SUSPENDED":
      return text.accountStatusSuspended;
    default:
      return status;
  }
};

function Field({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--ink-primary)]">{children}</dd>
    </div>
  );
}

export const ProctorProfileView = (): ReactElement => {
  const user = useCurrentUser();
  const text = useProctorWorkspaceText();

  if (user.isLoading) {
    return (
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
        <LoadingState variant="rows" rows={4} label={text.profileLoading} />
      </div>
    );
  }

  if (user.isError || !user.data) {
    return (
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
        <ErrorState
          title={text.profileErrorTitle}
          description={text.profileErrorDescription}
          action={
            <Button variant="secondary" size="sm" onClick={() => void user.refetch()}>
              {text.profileRetry}
            </Button>
          }
        />
      </div>
    );
  }

  const data = user.data;
  const roles =
    data.roles.length > 0
      ? data.roles.map((role) => roleLabel(role, text)).join(", ")
      : text.profileEmptyRoles;
  const organization = data.organizationName || text.profileEmptyOrganization;

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">

      <dl className="grid grid-cols-1 gap-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-6 shadow-sm sm:grid-cols-2">
        <Field label={text.profileFullName}>{data.fullName || text.profileEmptyName}</Field>
        <Field label={text.profileEmail}>{data.email}</Field>
        <Field label={text.profileRoles}>{roles}</Field>
        <Field label={text.profileStatus}>{statusLabel(data.status, text)}</Field>
        <Field label={text.profileOrganization}>{organization}</Field>
      </dl>
    </div>
  );
};