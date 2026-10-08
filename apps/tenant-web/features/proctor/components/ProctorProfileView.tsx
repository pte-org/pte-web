"use client";

import type { ReactElement, ReactNode } from "react";
import { Button, PageHeader, Skeleton } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { PROCTOR_PROFILE_TEXT as T } from "../constants";

function Field({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  );
}

function ProfileSkeleton(): ReactElement {
  return (
    <div className="space-y-6 p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function ProfileError({ onRetry }: { onRetry: () => void }): ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold text-gray-900">{T.ERROR_TITLE}</h1>
      <p className="max-w-md text-sm text-gray-600">{T.ERROR_DESCRIPTION}</p>
      <Button onClick={onRetry}>{T.RETRY}</Button>
    </div>
  );
}

export const ProctorProfileView = (): ReactElement => {
  const user = useCurrentUser();

  if (user.isLoading) return <ProfileSkeleton />;
  if (user.isError || !user.data) {
    return <ProfileError onRetry={() => void user.refetch()} />;
  }

  const data = user.data;
  const roles = data.roles.length > 0 ? data.roles.join(T.ROLES_SEPARATOR) : T.EMPTY_FULL_NAME;
  const tenant = data.tenantId ?? T.EMPTY_TENANT;

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />

      <dl className="grid grid-cols-1 gap-5 rounded-lg border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <Field label={T.FULL_NAME_LABEL}>{data.fullName || T.EMPTY_FULL_NAME}</Field>
        <Field label={T.EMAIL_LABEL}>{data.email}</Field>
        <Field label={T.ROLES_LABEL}>{roles}</Field>
        <Field label={T.STATUS_LABEL}>{data.status}</Field>
        <Field label={T.TENANT_LABEL}>{tenant}</Field>
      </dl>
    </div>
  );
};