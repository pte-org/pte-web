"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Alert, BookOpenIcon, CollapsibleSection, PageHeader, StatCard, UsersIcon } from "@pte/ui";
import type { PlanResponse } from "@pte/api-client";
import { useStudentQuotaQuery, useSubscriptionsQuery, useTenantPlansQuery } from "../api";
import { BillingPanel } from "./BillingPanel";

const money = (plan: PlanResponse): string => `${Number(plan.price).toLocaleString()} ${plan.currency}`;

export const PlanCatalogView = (): ReactElement => {
  const { data: plans = [], isLoading, isError } = useTenantPlansQuery();
  const { data: quota } = useStudentQuotaQuery();
  const { data: subscriptions = [] } = useSubscriptionsQuery();
  const activePlans = plans.filter((plan) => plan.status === "ACTIVE");
  const examPlans = activePlans.filter((plan) => plan.type === "EXAM_PACKAGE");
  const capacityPlans = activePlans.filter((plan) => plan.type === "STUDENT_CAPACITY");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Plans & billing" subtitle="Choose exam access or extend your student capacity." />
      {isError && <Alert tone="error">Plans could not be loaded. Try again shortly.</Alert>}
      <CollapsibleSection
        title="Billing overview"
        subtitle="Current quota, subscriptions and available plans."
        contentClassName="grid gap-4 sm:grid-cols-3"
      >
        <StatCard label="Student limit" value={quota ? `${quota.current} / ${quota.limit}` : "—"} footnote="Current roster usage" accent="blue" />
        <StatCard label="Active subscriptions" value={String(subscriptions.length)} footnote="Loaded from API" accent="mint" />
        <StatCard label="Available plans" value={String(activePlans.length)} footnote="Active catalog entries" accent="cream" />
      </CollapsibleSection>
      <BillingPanel title="Exam packages" subtitle="Time-limited access with a student cap per exam.">
        {isLoading ? <p className="text-sm text-slate-500">Loading plans...</p> : <div className="grid gap-4 md:grid-cols-2">{examPlans.map((plan) => <PlanCard key={plan.publicId} plan={plan} icon={<BookOpenIcon />} />)}</div>}
      </BillingPanel>
      <BillingPanel title="Student capacity" subtitle="Permanent quota add-ons, separate from exam packages.">
        <div className="grid gap-4 md:grid-cols-2">{capacityPlans.map((plan) => <PlanCard key={plan.publicId} plan={plan} icon={<UsersIcon />} />)}</div>
      </BillingPanel>
      <div className="flex flex-wrap gap-4 text-sm"><Link href="/host/orders" className="font-semibold text-action hover:underline">View order history</Link><Link href="/host/subscriptions" className="font-semibold text-action hover:underline">View active access</Link><Link href="/host/redeem-license" className="font-semibold text-action hover:underline">Redeem a license code</Link></div>
    </div>
  );
};

const PlanCard = ({ plan, icon }: { plan: PlanResponse; icon: ReactElement }): ReactElement => (
  <article className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-blue-700 [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className="text-xl font-bold text-slate-950">{money(plan)}</span></div>
    <h3 className="mt-5 text-base font-semibold text-slate-950">{plan.name}</h3>
    <p className="mt-1 text-xs text-slate-500">{plan.durationDays ? `${plan.durationDays} days` : "Permanent"}</p>
    <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">{plan.type === "EXAM_PACKAGE" ? `Up to ${plan.maxStudentsPerSession ?? "—"} students / session` : `+${plan.extraStudentSlots ?? "—"} students`}</p>
    <p className="mt-3 text-sm text-slate-500">{plan.description || "No description provided."}</p>
    <Link href={`/host/checkout?planId=${encodeURIComponent(plan.publicId)}`} className="mt-5 inline-flex h-8 items-center justify-center rounded-md bg-action px-3 text-xs font-medium text-white shadow-sm shadow-action/25 hover:bg-action-hover">Buy now</Link>
  </article>
);
