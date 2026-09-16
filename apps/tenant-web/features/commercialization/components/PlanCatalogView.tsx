"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { BookOpenIcon, PageHeader, StatCard, UsersIcon } from "@pte/ui";
import { TENANT_PLANS } from "../data";
import { BillingPanel } from "./BillingPanel";

export const PlanCatalogView = (): ReactElement => (
  <div className="flex flex-col gap-5">
    <PageHeader
      title="Plans & billing"
      subtitle="Choose exam access or extend your student capacity."
    />
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Student limit"
        value="100 / 100"
        footnote="Free capacity used"
        accent="blue"
      />
      <StatCard label="Active exam packages" value="1" footnote="Exam Growth" accent="mint" />
      <StatCard label="Next expiry" value="Dec 14" footnote="Exam Growth" accent="cream" />
    </div>

    <BillingPanel title="Exam packages" subtitle="Time-limited access with a student cap per exam.">
      <div className="grid gap-4 md:grid-cols-2">
        {TENANT_PLANS.filter((plan) => plan.family === "Exam package").map((plan) => (
          <PlanCard key={plan.id} plan={plan} icon={<BookOpenIcon />} />
        ))}
      </div>
    </BillingPanel>
    <BillingPanel
      title="Student capacity"
      subtitle="Permanent quota add-ons, separate from exam packages."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {TENANT_PLANS.filter((plan) => plan.family === "Student capacity").map((plan) => (
          <PlanCard key={plan.id} plan={plan} icon={<UsersIcon />} />
        ))}
      </div>
    </BillingPanel>
    <div className="flex flex-wrap gap-4 text-sm">
      <Link href="/host/orders" className="font-semibold text-action hover:underline">
        View order history
      </Link>
      <Link href="/host/subscriptions" className="font-semibold text-action hover:underline">
        View active access
      </Link>
      <Link href="/host/redeem-license" className="font-semibold text-action hover:underline">
        Redeem a license code
      </Link>
    </div>
  </div>
);

type Plan = (typeof TENANT_PLANS)[number];

const PlanCard = ({ plan, icon }: { plan: Plan; icon: ReactElement }): ReactElement => (
  <article className={`rounded-xl border bg-white p-5 ${plan.tone}`}>
    <div className="flex items-start justify-between gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-blue-700 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <span className="text-xl font-bold text-slate-950">{plan.price}</span>
    </div>
    <h3 className="mt-5 text-base font-semibold text-slate-950">{plan.name}</h3>
    <p className="mt-1 text-xs text-slate-500">{plan.term}</p>
    <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
      {plan.capacity}
    </p>
    <p className="mt-3 text-sm text-slate-500">{plan.description}</p>
    <Link
      href="/host/checkout"
      className="mt-5 inline-flex h-8 items-center justify-center rounded-md bg-action px-3 text-xs font-medium text-white shadow-sm shadow-action/25 hover:bg-action-hover"
    >
      Buy now
    </Link>
  </article>
);
