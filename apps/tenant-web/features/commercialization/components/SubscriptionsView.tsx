"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, PageHeader } from "@pte/ui";
import { useSubscriptionsQuery } from "../api";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

const mask = (value: string): string => value.length > 4 ? `•••• ${value.slice(-4)}` : "••••";

export const SubscriptionsView = (): ReactElement => {
  const { data: subscriptions = [], isLoading, isError } = useSubscriptionsQuery();
  const [now] = useState(() => Date.now());
  const examSubscriptions = subscriptions.filter((item) => item.maxStudentsPerSession !== null);
  const capacitySubscriptions = subscriptions.filter((item) => item.maxStudentsPerSession === null);
  const expiringSoon = examSubscriptions.filter((item) => new Date(item.expiresAt).getTime() - now < 7 * 24 * 60 * 60 * 1000);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Active access" subtitle="Your exam packages and permanent capacity add-ons." actions={<Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">Manage plans</Link>} />
      {isError && <Alert tone="error">Subscriptions could not be loaded.</Alert>}
      {expiringSoon.length > 0 && <Alert tone="warning">One or more exam packages expire within 7 days. Review the catalog before scheduling another exam.</Alert>}
      <BillingPanel title="Exam subscriptions" subtitle="Exam packages are independent subscriptions.">
        {isLoading && <p className="text-sm text-slate-500">Loading subscriptions...</p>}
        {!isLoading && examSubscriptions.length === 0 && <p className="text-sm text-slate-500">No exam subscriptions found. <Link href="/host/billing" className="font-semibold text-action hover:underline">Browse plans</Link>.</p>}
        <div className="space-y-4">{examSubscriptions.map((subscription) => <div key={subscription.publicId} className="rounded-lg border border-blue-100 bg-blue-50/50 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-base font-semibold text-slate-900">Plan {subscription.planId}</p><p className="mt-1 text-sm text-slate-500">Started {new Date(subscription.startsAt).toLocaleDateString()} · Expires {new Date(subscription.expiresAt).toLocaleDateString()}</p></div><BillingStatusBadge status={subscription.status} /></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Metric label="Student cap" value={String(subscription.maxStudentsPerSession)} /><Metric label="Activation" value={subscription.activationSource} /><Metric label="License key" value={mask(subscription.licenseKey)} /></div></div>)}</div>
      </BillingPanel>
      <BillingPanel title="Capacity ledger" subtitle="Permanent quota purchased for this tenant.">
        {capacitySubscriptions.length === 0 ? <p className="text-sm text-slate-500">No capacity add-ons found.</p> : capacitySubscriptions.map((subscription) => <div key={subscription.publicId} className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-base font-semibold text-slate-900">Plan {subscription.planId}</p><p className="mt-1 text-sm text-slate-500">Activated {new Date(subscription.startsAt).toLocaleDateString()}</p></div><Badge variant="success">{subscription.status}</Badge></div>)}
      </BillingPanel>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }): ReactElement => <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value}</p></div>;
