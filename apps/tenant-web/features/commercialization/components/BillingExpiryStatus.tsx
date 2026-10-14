"use client";

import type { ReactElement } from "react";
import type { SubscriptionResponse } from "@pte/api-client";
import { useLocale, type Locale } from "@pte/ui";
import { BILLING_TEXT as T } from "../constants";

const formatDate = (value: string, locale: Locale): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const BillingExpiryStatus = ({
  planName,
  subscriptions,
}: {
  planName: string;
  subscriptions: SubscriptionResponse[];
}): ReactElement => {
  const { locale, t } = useLocale();
  const latestExpiry = subscriptions.reduce((latest, subscription) =>
    new Date(subscription.expiresAt).getTime() > new Date(latest.expiresAt).getTime()
      ? subscription
      : latest,
  );
  const examCapacity = subscriptions[0]?.maxStudentsPerSession;

  return (
    <div className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(9rem,0.8fr)] sm:items-center">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
          {t("tenant.billing.examPackageLabel", T.EXAM_PACKAGES)}
        </p>
        <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">{planName}</p>
        {examCapacity !== undefined && (
          <p className="mt-1 text-xs text-[var(--ink-secondary)]">
            {t("tenant.billing.examCapacity", T.EXAM_CAPACITY(examCapacity), {
              count: examCapacity,
            })}
          </p>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
          {t("tenant.billing.expiryStatus", T.EXPIRY_STATUS)}
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--ink-primary)]">
          {formatDate(latestExpiry.expiresAt, locale)}
        </p>
      </div>
    </div>
  );
};
