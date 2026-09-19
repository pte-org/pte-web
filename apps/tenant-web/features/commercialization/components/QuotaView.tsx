"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, CollapsibleSection, Input, PageHeader, ProgressBar, StatCard, UsersIcon } from "@pte/ui";
import { ApiError } from "@pte/api-client";
import { useStudentImportPreview, useStudentQuotaQuery } from "../api";
import { BillingPanel } from "./BillingPanel";

export const QuotaView = (): ReactElement => {
  const { data: quota, isLoading, isError } = useStudentQuotaQuery();
  const preview = useStudentImportPreview();
  const [adding, setAdding] = useState("18");
  const usedPercentage = quota && quota.limit > 0 ? Math.min(100, Math.round((quota.current / quota.limit) * 100)) : 0;
  const errorMessage = preview.error instanceof ApiError ? preview.error.message : preview.error ? "Quota could not be loaded or previewed." : isError ? "Quota could not be loaded or previewed." : undefined;
  const runPreview = (): void => {
    const count = Number(adding);
    if (Number.isInteger(count) && count >= 0) void preview.mutateAsync({ adding: count });
  };
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Student capacity" subtitle="Check capacity before importing a roster." actions={<Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">Add capacity</Link>} />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {isLoading && <p className="text-sm text-slate-500">Loading quota...</p>}
      {quota && <>
        <CollapsibleSection
          title="Capacity overview"
          subtitle="Current student capacity and import preview."
          contentClassName="grid gap-4 sm:grid-cols-3"
        >
          <StatCard label="Students in tenant" value={String(quota.current)} footnote={`of ${quota.limit} total capacity`} icon={<UsersIcon />} progress={usedPercentage} accent="blue" />
          <StatCard label="Remaining capacity" value={String(quota.remaining)} footnote="students available" accent="mint" />
          <StatCard label="Last preview" value={preview.data ? String(preview.data.adding) : "—"} footnote="students to add" accent="sky" />
        </CollapsibleSection>
        <BillingPanel title="Current capacity" subtitle="Free limit plus permanent capacity add-ons."><div className="flex items-center justify-between text-sm"><span className="font-semibold text-slate-900">{quota.current} of {quota.limit} students</span><span className="text-slate-500">{usedPercentage}% used</span></div><ProgressBar value={usedPercentage} max={100} className="mt-3" label="Student capacity used" />{usedPercentage >= 80 ? <Alert className="mt-5" tone="warning">Capacity is almost full. <Link href="/host/billing" className="font-semibold underline">Add student capacity</Link> before importing a large roster.</Alert> : <Alert className="mt-5" tone="info">Roster imports are checked before new students are added.</Alert>}</BillingPanel>
        <BillingPanel title="Import preview" subtitle="Ask the backend whether a roster can be added before uploading it."><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><Input id="preview-adding" label="Students to add" type="number" min="0" value={adding} onChange={(event) => setAdding(event.target.value)} /><Button onClick={runPreview} isLoading={preview.isPending}>Preview quota</Button></div>{preview.data && <div className="mt-5 grid gap-3 rounded-md bg-slate-50 p-4 text-sm sm:grid-cols-4"><Metric label="Current" value={String(preview.data.current)} /><Metric label="Adding" value={String(preview.data.adding)} /><Metric label="Remaining" value={String(preview.data.remaining)} /><Metric label="Result" value={preview.data.allowed ? "Allowed" : "Blocked"} tone={preview.data.allowed ? "text-emerald-700" : "text-rose-700"} /></div>}</BillingPanel>
      </>}
    </div>
  );
};

const Metric = ({ label, value, tone = "text-slate-900" }: { label: string; value: string; tone?: string }): ReactElement => <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 font-semibold ${tone}`}>{value}</p></div>;
