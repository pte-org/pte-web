"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { PlanResponse } from "@pte/api-client";
import { DashboardCard, useLocale, type Locale } from "@pte/ui";
import { BILLING_TEXT as T, PLANS_HOME_HREF } from "../constants";

const formatPrice = (plan: PlanResponse, locale: Locale): string =>
  `${Number(plan.price).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")} ${plan.currency}`;

export const BillingAccessCard = ({
  plan,
  planName,
}: {
  plan?: PlanResponse;
  planName: string;
}): ReactElement => {
  const { locale, t } = useLocale();
  const period = !plan
    ? ""
    : plan.durationDays === 30
      ? t("tenant.billing.monthlyPeriod", T.MONTHLY_PERIOD)
      : plan.durationDays
        ? t("tenant.billing.days", T.PLAN_DURATION(plan.durationDays), {
            count: plan.durationDays,
          })
        : t("tenant.billing.permanent", T.PERMANENT);

  return (
    <DashboardCard className="p-4 shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[var(--ink-primary)]">{planName}</h3>
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">
            {plan ? formatPrice(plan, locale) : t("common.emptyValue", T.EMPTY_VALUE)}
            {period}
          </p>
        </div>
        <Link
          href={PLANS_HOME_HREF}
          className="shrink-0 self-start rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--ink-primary)] transition-colors hover:bg-[var(--action-tint)] sm:self-auto"
        >
          {t("tenant.billing.viewPlansOnHome", T.VIEW_PLANS_ON_HOME)}
        </Link>
      </div>
    </DashboardCard>
  );
};
