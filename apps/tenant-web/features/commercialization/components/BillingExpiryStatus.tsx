"use client";

import type { ReactElement } from "react";
import type { SubscriptionResponse } from "@pte/api-client";
import { Badge, useLocale, type Locale } from "@pte/ui";
import { BILLING_TEXT as T } from "../constants";
import { activationSourceKey, isPendingSubscription } from "../utils/subscriptionStatus";

const formatDate = (value: string, locale: Locale): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

/** One package lane: its source, its cap, and whether it is running or starts later. */
export const BillingExpiryStatus = ({
  planName,
  subscription,
}: {
  planName: string;
  subscription: SubscriptionResponse;
}): ReactElement => {
  const { locale, t } = useLocale();
  const pending = isPendingSubscription(subscription);
  const startsOn = formatDate(subscription.startsAt, locale);
  const expiresOn = formatDate(subscription.expiresAt, locale);
  const source =
    activationSourceKey(subscription.activationSource) === "payment"
      ? t("tenant.billing.activationSourcePayment", T.ACTIVATION_SOURCE_PAYMENT)
      : t("tenant.billing.activationSourceLicense", T.ACTIVATION_SOURCE_LICENSE);
  const examCapacity = subscription.maxStudentsPerSession;

  return (
    <div className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(9rem,0.8fr)] sm:items-center">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
          {t("tenant.billing.examPackageLabel", T.EXAM_PACKAGES)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">{planName}</p>
          <Badge variant="neutral">{source}</Badge>
        </div>
        <p className="mt-1 text-xs text-[var(--ink-secondary)]">
          {t("tenant.billing.examCapacity", T.EXAM_CAPACITY(examCapacity), {
            count: examCapacity,
          })}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
          {t("tenant.billing.expiryStatus", T.EXPIRY_STATUS)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant={pending ? "info" : "success"}>
            {pending
              ? t("tenant.billing.accessStartsOn", T.ACCESS_STARTS_ON(startsOn), { date: startsOn })
              : t("tenant.billing.accessActiveUntil", T.ACCESS_ACTIVE_UNTIL(expiresOn), {
                  date: expiresOn,
                })}
          </Badge>
        </div>
      </div>
    </div>
  );
};
