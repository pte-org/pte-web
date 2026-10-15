"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { Button, ErrorState, LoadingState, PageHeader } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { PROCTOR_PROFILE_TEXT as T } from "../constants";

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

  if (user.isLoading) {
    return (
      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />
        <LoadingState variant="rows" rows={4} label={T.LOADING} />
      </div>
    );
  }

  if (user.isError || !user.data) {
    return (
      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />
        <ErrorState
          title={T.ERROR_TITLE}
          description={T.ERROR_DESCRIPTION}
          action={
            <Button variant="secondary" size="sm" onClick={() => void user.refetch()}>
              {T.RETRY}
            </Button>
          }
        />
      </div>
    );
  }

  const data = user.data;
  const roles = data.roles.length > 0 ? data.roles.join(T.ROLES_SEPARATOR) : T.EMPTY_ROLES;
  const tenant = data.tenantId ?? T.EMPTY_TENANT;

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <PageHeader
        title={T.TITLE}
        subtitle={T.SUBTITLE}
        actions={
          <Link href="/proctor/sessions">
            <Button variant="secondary" size="sm">
              {T.VIEW_ASSIGNED_SESSIONS}
            </Button>
          </Link>
        }
      />

      <dl className="grid grid-cols-1 gap-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-6 shadow-sm sm:grid-cols-2">
        <Field label={T.FULL_NAME_LABEL}>{data.fullName || T.EMPTY_FULL_NAME}</Field>
        <Field label={T.EMAIL_LABEL}>{data.email}</Field>
        <Field label={T.ROLES_LABEL}>{roles}</Field>
        <Field label={T.STATUS_LABEL}>{data.status}</Field>
        <Field label={T.TENANT_LABEL}>{tenant}</Field>
      </dl>
    </div>
  );
};