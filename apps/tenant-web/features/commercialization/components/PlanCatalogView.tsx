"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import {
  Alert,
  BookOpenIcon,
  ChevronRightIcon,
  ClipboardIcon,
  DocumentIcon,
  LicenseIcon,
  PageHeader,
  useLocale,
  UsersIcon,
} from "@pte/ui";
import type { PlanResponse } from "@pte/api-client";
import { useTenantPlansQuery } from "../api";
import { BILLING_TEXT as T } from "../constants";
import { BillingPanel } from "./BillingPanel";

const money = (plan: PlanResponse): string =>
  `${Number(plan.price).toLocaleString()} ${plan.currency}`;

export const PlanCatalogView = (): ReactElement => {
  const { t } = useLocale();
  const text = {
    title: t("tenant.billing.title", T.PLANS_TITLE),
    subtitle: t("tenant.billing.subtitle", T.PLANS_SUBTITLE),
    loadFailed: t("tenant.billing.loadFailed", T.PLANS_LOAD_ERROR),
    examPackages: t("tenant.billing.examPackages", T.EXAM_PACKAGES),
    examPackagesSubtitle: t("tenant.billing.examPackagesSubtitle", T.EXAM_PACKAGES_SUBTITLE),
    studentCapacity: t("tenant.billing.studentCapacity", T.STUDENT_CAPACITY),
    studentCapacitySubtitle: t(
      "tenant.billing.studentCapacitySubtitle",
      T.STUDENT_CAPACITY_SUBTITLE,
    ),
    loadingPlans: t("tenant.billing.loadingPlans", T.LOADING_PLANS),
    viewOrderHistory: t("tenant.billing.viewOrderHistory", T.VIEW_ORDER_HISTORY),
    viewActiveAccess: t("tenant.billing.viewActiveAccess", T.VIEW_ACTIVE_ACCESS),
    redeemLicense: t("tenant.billing.redeemLicense", T.REDEEM_LICENSE),
  };
  const { data: plans = [], isLoading, isError } = useTenantPlansQuery();
  const activePlans = plans.filter((plan) => plan.status === "ACTIVE");
  const examPlans = activePlans.filter((plan) => plan.type === "EXAM_PACKAGE");
  const capacityPlans = activePlans.filter((plan) => plan.type === "STUDENT_CAPACITY");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={text.title} subtitle={text.subtitle} />
      {isError && <Alert tone="error">{text.loadFailed}</Alert>}
      <BillingPanel title={text.examPackages} subtitle={text.examPackagesSubtitle}>
        {isLoading ? (
          <p className="text-sm text-slate-500">{text.loadingPlans}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {examPlans.map((plan) => (
              <PlanCard key={plan.publicId} plan={plan} icon={<BookOpenIcon />} />
            ))}
          </div>
        )}
      </BillingPanel>
      <BillingPanel title={text.studentCapacity} subtitle={text.studentCapacitySubtitle}>
        <div className="grid gap-4 md:grid-cols-2">
          {capacityPlans.map((plan) => (
            <PlanCard key={plan.publicId} plan={plan} icon={<UsersIcon />} />
          ))}
        </div>
      </BillingPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/host/orders"
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
              <ClipboardIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-700">
              {text.viewOrderHistory}
            </span>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
        </Link>

        <Link
          href="/host/subscriptions"
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
              <LicenseIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-700">
              {text.viewActiveAccess}
            </span>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
        </Link>

        <Link
          href="/host/redeem-license"
          className="group flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/80 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-200">
              <DocumentIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-blue-900 transition-colors group-hover:text-blue-700">
              {text.redeemLicense}
            </span>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-blue-500 transition-all group-hover:translate-x-0.5 group-hover:text-blue-700" />
        </Link>
      </div>
    </div>
  );
};

const PlanCard = ({ plan, icon }: { plan: PlanResponse; icon: ReactElement }): ReactElement => {
  const { t } = useLocale();
  const duration = plan.durationDays
    ? t("tenant.billing.days", T.PLAN_DURATION(plan.durationDays), {
        count: plan.durationDays,
      })
    : t("tenant.billing.permanent", T.PERMANENT);
  const capacity =
    plan.type === "EXAM_PACKAGE"
      ? t("tenant.billing.upToStudents", T.UP_TO_STUDENTS(plan.maxStudentsPerSession ?? "—"), {
          count: plan.maxStudentsPerSession ?? "—",
        })
      : t("tenant.billing.extraStudents", T.EXTRA_STUDENTS(plan.extraStudentSlots ?? "—"), {
          count: plan.extraStudentSlots ?? "—",
        });

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-blue-700 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </span>
        <span className="text-xl font-bold text-slate-950">{money(plan)}</span>
      </div>
      <h3 className="mt-5 text-base font-semibold text-slate-950">{plan.name}</h3>
      <p className="mt-1 text-xs text-slate-500">{duration}</p>
      <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
        {capacity}
      </p>
      <p className="mt-3 text-sm text-slate-500">
        {plan.description || t("tenant.billing.noDescription", T.NO_DESCRIPTION)}
      </p>
      <Link
        href={`/host/checkout?planId=${encodeURIComponent(plan.publicId)}`}
        className="mt-5 inline-flex h-8 items-center justify-center rounded-md bg-action px-3 text-xs font-medium text-white shadow-sm shadow-action/25 hover:bg-action-hover"
      >
        {t("tenant.billing.buyNow", T.BUY_NOW)}
      </Link>
    </article>
  );
};
