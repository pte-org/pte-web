"use client";

import type { ReactElement } from "react";
import type { StudentQuotaResponse } from "@pte/api-client";
import { ProgressBar, useLocale } from "@pte/ui";
import { BILLING_TEXT as T } from "../constants";

export const BillingCapacitySummary = ({
  quota,
}: {
  quota: StudentQuotaResponse;
}): ReactElement => {
  const { t } = useLocale();
  const usedPercentage =
    quota.limit > 0 ? Math.min(100, Math.round((quota.current / quota.limit) * 100)) : 0;
  const tone = usedPercentage >= 95 ? "danger" : usedPercentage >= 80 ? "warning" : "success";

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(9rem,0.8fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
            {t("tenant.billing.capacityOverview", T.CAPACITY_OVERVIEW)}
          </p>
          <p className="text-sm font-semibold text-[var(--ink-primary)]">
            {t("tenant.billing.currentUsage", T.CURRENT_USAGE(quota.current, quota.limit), {
              current: quota.current,
              limit: quota.limit,
            })}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            {t("tenant.billing.studentCapacityUsed", T.STUDENT_CAPACITY_USED)}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink-primary)]">
            {t("tenant.billing.used", T.USED(usedPercentage), { percentage: usedPercentage })}
          </p>
        </div>
      </div>
      <ProgressBar
        value={usedPercentage}
        max={100}
        tone={tone}
        className="mt-3"
        label={t("tenant.billing.studentCapacityUsed", T.STUDENT_CAPACITY_USED)}
      />
      <p className="mt-2 text-xs text-[var(--ink-secondary)]">
        {t("tenant.billing.remainingCapacity", T.REMAINING_CAPACITY)}: {quota.remaining}
      </p>
    </div>
  );
};
