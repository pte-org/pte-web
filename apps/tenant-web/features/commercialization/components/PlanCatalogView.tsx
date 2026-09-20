"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Alert, BookOpenIcon, CollapsibleSection, PageHeader, StatCard, UsersIcon } from "@pte/ui";
import type { PlanResponse } from "@pte/api-client";
import { useStudentQuotaQuery, useSubscriptionsQuery, useTenantPlansQuery } from "../api";
import { BILLING_TEXT as T } from "../constants";
import { BillingPanel } from "./BillingPanel";

const money = (plan: PlanResponse): string =>
  `${Number(plan.price).toLocaleString()} ${plan.currency}`;

export const PlanCatalogView = (): ReactElement => {
  const { data: plans = [], isLoading, isError } = useTenantPlansQuery();
  const { data: quota } = useStudentQuotaQuery();
  const { data: subscriptions = [] } = useSubscriptionsQuery();
  const activePlans = plans.filter((plan) => plan.status === "ACTIVE");
  const examPlans = activePlans.filter((plan) => plan.type === "EXAM_PACKAGE");
  const capacityPlans = activePlans.filter((plan) => plan.type === "STUDENT_CAPACITY");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.PLANS_TITLE} subtitle={T.PLANS_SUBTITLE} />
      {isError && <Alert tone="error">{T.PLANS_LOAD_ERROR}</Alert>}
      <CollapsibleSection
        title={T.BILLING_OVERVIEW}
        subtitle={T.BILLING_OVERVIEW_SUBTITLE}
        contentClassName="grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          label={T.STUDENT_LIMIT}
          value={quota ? `${quota.current} / ${quota.limit}` : T.EMPTY_VALUE}
          footnote={T.CURRENT_ROSTER_USAGE_LABEL}
          accent="blue"
        />
        <StatCard
          label={T.ACTIVE_SUBSCRIPTIONS}
          value={String(subscriptions.length)}
          footnote={T.LOADED_FROM_API}
          accent="mint"
        />
        <StatCard
          label={T.AVAILABLE_PLANS}
          value={String(activePlans.length)}
          footnote={T.ACTIVE_CATALOG_ENTRIES}
          accent="cream"
        />
      </CollapsibleSection>
      <BillingPanel title={T.EXAM_PACKAGES} subtitle={T.EXAM_PACKAGES_SUBTITLE}>
        {isLoading ? (
          <p className="text-sm text-slate-500">{T.LOADING_PLANS}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {examPlans.map((plan) => (
              <PlanCard key={plan.publicId} plan={plan} icon={<BookOpenIcon />} />
            ))}
          </div>
        )}
      </BillingPanel>
      <BillingPanel title={T.STUDENT_CAPACITY} subtitle={T.STUDENT_CAPACITY_SUBTITLE}>
        <div className="grid gap-4 md:grid-cols-2">
          {capacityPlans.map((plan) => (
            <PlanCard key={plan.publicId} plan={plan} icon={<UsersIcon />} />
          ))}
        </div>
      </BillingPanel>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/host/orders" className="font-semibold text-action hover:underline">
          {T.VIEW_ORDER_HISTORY}
        </Link>
        <Link href="/host/subscriptions" className="font-semibold text-action hover:underline">
          {T.VIEW_ACTIVE_ACCESS}
        </Link>
        <Link href="/host/redeem-license" className="font-semibold text-action hover:underline">
          {T.REDEEM_LICENSE}
        </Link>
      </div>
    </div>
  );
};

const PlanCard = ({ plan, icon }: { plan: PlanResponse; icon: ReactElement }): ReactElement => (
  <article className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-blue-700 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <span className="text-xl font-bold text-slate-950">{money(plan)}</span>
    </div>
    <h3 className="mt-5 text-base font-semibold text-slate-950">{plan.name}</h3>
    <p className="mt-1 text-xs text-slate-500">
      {plan.durationDays ? T.PLAN_DURATION(plan.durationDays) : T.PERMANENT}
    </p>
    <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
      {plan.type === "EXAM_PACKAGE"
        ? T.UP_TO_STUDENTS(plan.maxStudentsPerSession ?? T.EMPTY_VALUE)
        : T.EXTRA_STUDENTS(plan.extraStudentSlots ?? T.EMPTY_VALUE)}
    </p>
    <p className="mt-3 text-sm text-slate-500">{plan.description || T.NO_DESCRIPTION}</p>
    <Link
      href={`/host/checkout?planId=${encodeURIComponent(plan.publicId)}`}
      className="mt-5 inline-flex h-8 items-center justify-center rounded-md bg-action px-3 text-xs font-medium text-white shadow-sm shadow-action/25 hover:bg-action-hover"
    >
      {T.BUY_NOW}
    </Link>
  </article>
);
