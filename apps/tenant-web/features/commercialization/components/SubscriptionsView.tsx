"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Badge, PageHeader } from "@pte/ui";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

export const SubscriptionsView = (): ReactElement => (
  <div className="flex flex-col gap-5">
    <PageHeader
      title="Active access"
      subtitle="Your exam packages and permanent capacity add-ons."
      actions={
        <Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">
          Manage plans
        </Link>
      }
    />
    <BillingPanel
      title="Exam subscriptions"
      subtitle="Exam packages are independent subscriptions."
    >
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-900">Exam Growth</p>
            <p className="mt-1 text-sm text-slate-500">
              Started Sep 16, 2026 · Renews Dec 14, 2026
            </p>
          </div>
          <BillingStatusBadge status="ACTIVE" />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Metric label="Student cap" value="2,000 / exam" />
          <Metric label="Sessions used" value="4" />
          <Metric label="License key" value="•••• 9Q4R" />
        </div>
      </div>
    </BillingPanel>
    <BillingPanel title="Capacity ledger" subtitle="Permanent quota purchased for this tenant.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-slate-950">+500 students</p>
          <p className="mt-1 text-sm text-slate-500">Capacity +500 · Purchased Aug 28, 2026</p>
        </div>
        <Badge variant="success">Permanent</Badge>
      </div>
    </BillingPanel>
  </div>
);

const Metric = ({ label, value }: { label: string; value: string }): ReactElement => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
