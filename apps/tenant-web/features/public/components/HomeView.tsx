"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { PlanResponse } from "@pte/api-client";
import { BookOpenIcon, CheckCircleIcon, UsersIcon } from "@pte/ui";
import { useSessionManager } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { useTenantPlansQuery } from "@/features/commercialization/api";
import { PublicShell } from "./PublicShell";

const money = (plan: PlanResponse): string =>
  `${Number(plan.price).toLocaleString()} ${plan.currency}`;

const PackageCard = ({
  plan,
  tone = "border-slate-200",
  isOrganizationRegistered,
}: {
  plan: PlanResponse;
  tone?: string;
  isOrganizationRegistered: boolean;
}): ReactElement => (
  <article className={`rounded-xl border bg-white p-5 shadow-sm ${tone}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-slate-950">{plan.name}</h3>
        <p className="mt-1 text-xs text-slate-500">
          {plan.durationDays ? `${plan.durationDays} days` : "Permanent add-on"}
        </p>
      </div>
      <p className="text-sm font-bold text-slate-950">{money(plan)}</p>
    </div>
    <div className="mt-6 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-blue-700 shadow-sm">
        <CheckCircleIcon className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-slate-900">
        {plan.type === "EXAM_PACKAGE"
          ? `Up to ${plan.maxStudentsPerSession ?? "—"} students / exam`
          : `+${plan.extraStudentSlots ?? "—"} students`}
      </p>
    </div>
    <p className="mt-4 text-sm text-slate-500">
      {plan.description || "No description provided."}
    </p>
    <Link
      href={
        isOrganizationRegistered
          ? `/host/checkout?planId=${encodeURIComponent(plan.publicId)}`
          : AUTH_ROUTES.register
      }
      className="mt-5 inline-flex text-sm font-semibold text-action hover:underline"
    >
      {isOrganizationRegistered ? "Buy now" : "Register organization"}{" "}
      <span className="ml-1" aria-hidden="true">
        &rarr;
      </span>
    </Link>
  </article>
);

const PlanSection = ({
  title,
  plans,
  icon,
  iconTone,
  isOrganizationRegistered,
}: {
  title: string;
  plans: PlanResponse[];
  icon: ReactElement;
  iconTone: string;
  isOrganizationRegistered: boolean;
}): ReactElement => (
  <div className={title === "Exam packages" ? "" : "mt-12"}>
    <div className="flex items-center gap-3">
      <span className={`grid h-10 w-10 place-items-center rounded-md ${iconTone}`}>
        {icon}
      </span>
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {plans.map((plan, index) => (
        <PackageCard
          key={plan.publicId}
          plan={plan}
          tone={
            index === 1 && plan.type === "EXAM_PACKAGE"
              ? "border-blue-200 ring-1 ring-blue-100"
              : "border-slate-200"
          }
          isOrganizationRegistered={isOrganizationRegistered}
        />
      ))}
    </div>
  </div>
);

export const HomeView = (): ReactElement => {
  const { isReady, session } = useSessionManager();
  const { data: plans = [], isLoading, isError } = useTenantPlansQuery();
  const isOrganizationRegistered = isReady && Boolean(session?.tenantId);
  const activePlans = plans.filter((plan) => plan.status === "ACTIVE");
  const examPlans = activePlans.filter((plan) => plan.type === "EXAM_PACKAGE");
  const capacityPlans = activePlans.filter((plan) => plan.type === "STUDENT_CAPACITY");

  return (
    <PublicShell>
      <section id="plans" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
          {isLoading && (
            <p
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500"
              role="status"
            >
              Loading available plans...
            </p>
          )}
          {isError && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              role="alert"
            >
              Plans could not be loaded. Try again shortly.
            </p>
          )}
          {!isLoading && !isError && activePlans.length === 0 && (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No plans are currently available.
            </p>
          )}
          {!isLoading && !isError && examPlans.length > 0 && (
            <PlanSection
              title="Exam packages"
              plans={examPlans}
              icon={<BookOpenIcon className="h-5 w-5 text-blue-700" />}
              iconTone="bg-blue-50"
              isOrganizationRegistered={isOrganizationRegistered}
            />
          )}
          {!isLoading && !isError && capacityPlans.length > 0 && (
            <PlanSection
              title="Student capacity add-ons"
              plans={capacityPlans}
              icon={<UsersIcon className="h-5 w-5 text-emerald-700" />}
              iconTone="bg-emerald-50"
              isOrganizationRegistered={isOrganizationRegistered}
            />
          )}
        </div>
      </section>
    </PublicShell>
  );
};
