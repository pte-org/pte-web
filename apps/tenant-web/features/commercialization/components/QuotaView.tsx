"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  CollapsibleSection,
  Input,
  PageHeader,
  ProgressBar,
  StatCard,
  UsersIcon,
} from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useStudentImportPreview, useStudentQuotaQuery } from "../api";
import { BILLING_TEXT as T } from "../constants";
import { BillingPanel } from "./BillingPanel";

export const QuotaView = (): ReactElement => {
  const { data: quota, isLoading, isError } = useStudentQuotaQuery();
  const preview = useStudentImportPreview();
  const [adding, setAdding] = useState("18");
  const usedPercentage =
    quota && quota.limit > 0 ? Math.min(100, Math.round((quota.current / quota.limit) * 100)) : 0;
  const errorMessage = preview.error
    ? getUserFacingApiErrorMessage(preview.error, T.QUOTA_ERROR)
    : isError
      ? T.QUOTA_ERROR
      : undefined;

  const runPreview = (): void => {
    const count = Number(adding);
    if (Number.isInteger(count) && count >= 0) void preview.mutateAsync({ adding: count });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.QUOTA_TITLE}
        subtitle={T.QUOTA_SUBTITLE}
        actions={
          <Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">
            {T.ADD_CAPACITY}
          </Link>
        }
      />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {isLoading && <p className="text-sm text-slate-500">{T.LOADING_QUOTA}</p>}
      {quota && (
        <>
          <CollapsibleSection
            title={T.CAPACITY_OVERVIEW}
            subtitle={T.CAPACITY_OVERVIEW_SUBTITLE}
            contentClassName="grid gap-4 sm:grid-cols-3"
          >
            <StatCard
              label={T.STUDENTS_IN_TENANT}
              value={String(quota.current)}
              footnote={T.CURRENT_ROSTER_USAGE(quota.limit)}
              icon={<UsersIcon />}
              progress={usedPercentage}
              accent="blue"
            />
            <StatCard
              label={T.REMAINING_CAPACITY}
              value={String(quota.remaining)}
              footnote={T.STUDENTS_AVAILABLE}
              accent="mint"
            />
            <StatCard
              label={T.LAST_PREVIEW}
              value={preview.data ? String(preview.data.adding) : T.EMPTY_VALUE}
              footnote={T.STUDENTS_TO_ADD}
              accent="sky"
            />
          </CollapsibleSection>
          <BillingPanel title={T.CURRENT_CAPACITY} subtitle={T.CURRENT_CAPACITY_SUBTITLE}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900">
                {T.CURRENT_USAGE(quota.current, quota.limit)}
              </span>
              <span className="text-slate-500">{T.USED(usedPercentage)}</span>
            </div>
            <ProgressBar
              value={usedPercentage}
              max={100}
              className="mt-3"
              label={T.STUDENT_CAPACITY_USED}
            />
            {usedPercentage >= 80 ? (
              <Alert className="mt-5" tone="warning">
                {T.CAPACITY_ALMOST_FULL}{" "}
                <Link href="/host/billing" className="font-semibold underline">
                  {T.ADD_STUDENT_CAPACITY}
                </Link>{" "}
                {T.CAPACITY_WARNING_SUFFIX}
              </Alert>
            ) : (
              <Alert className="mt-5" tone="info">
                {T.ROSTER_IMPORT_NOTICE}
              </Alert>
            )}
          </BillingPanel>
          <BillingPanel title={T.IMPORT_PREVIEW} subtitle={T.IMPORT_PREVIEW_SUBTITLE}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                id="preview-adding"
                label={T.STUDENTS_TO_ADD}
                type="number"
                min="0"
                value={adding}
                onChange={(event) => setAdding(event.target.value)}
              />
              <Button onClick={runPreview} isLoading={preview.isPending}>
                {T.PREVIEW_QUOTA}
              </Button>
            </div>
            {preview.data && (
              <div className="mt-5 grid gap-3 rounded-md bg-slate-50 p-4 text-sm sm:grid-cols-4">
                <Metric label={T.CURRENT} value={String(preview.data.current)} />
                <Metric label={T.ADDING} value={String(preview.data.adding)} />
                <Metric label={T.REMAINING} value={String(preview.data.remaining)} />
                <Metric
                  label={T.RESULT}
                  value={preview.data.allowed ? T.ALLOWED : T.BLOCKED}
                  tone={preview.data.allowed ? "text-emerald-700" : "text-rose-700"}
                />
              </div>
            )}
          </BillingPanel>
        </>
      )}
    </div>
  );
};

const Metric = ({
  label,
  value,
  tone = "text-slate-900",
}: {
  label: string;
  value: string;
  tone?: string;
}): ReactElement => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-1 font-semibold ${tone}`}>{value}</p>
  </div>
);
