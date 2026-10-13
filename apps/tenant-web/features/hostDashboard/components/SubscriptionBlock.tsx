"use client";

import type { ReactElement } from "react";
import type { HostSubscriptionData } from "@pte/api-client";
import { Alert, Badge } from "@pte/ui";
import {
  PLAN_TYPE_MESSAGE_KEYS,
  SUBSCRIPTION_STATUS_BADGE_VARIANT,
  SUBSCRIPTION_STATUS_MESSAGE_KEYS,
} from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { buildSubscriptionRows, describeExpiry, expiryMessage } from "../utils/usage";

interface SubscriptionBlockProps {
  subscription: HostSubscriptionData;
  timeZone: string;
}

export const SubscriptionBlock = ({ subscription, timeZone }: SubscriptionBlockProps): ReactElement => {
  const { locale, messages, format } = useHostDashboardText();
  const rows = buildSubscriptionRows(subscription.current, locale, timeZone);
  const expiry = expiryMessage(describeExpiry(subscription.daysToExpiry));

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase text-[var(--ink-muted)]">
        {messages.usageSubscriptions}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--ink-secondary)]">{messages.usageNoSubscriptions}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[var(--ink-primary)]">
                    {row.planName ?? messages.planNameFallback}
                  </span>
                  <span className="block text-xs text-[var(--ink-secondary)]">
                    {row.planType ? messages[PLAN_TYPE_MESSAGE_KEYS[row.planType]] : messages.planTypeUnknown}
                    {row.expiresOn && ` · ${format("usageExpiresOn", { date: row.expiresOn })}`}
                  </span>
                </span>
                <Badge variant={SUBSCRIPTION_STATUS_BADGE_VARIANT[row.status]}>
                  {messages[SUBSCRIPTION_STATUS_MESSAGE_KEYS[row.status]]}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--ink-muted)]">{format(expiry.key, expiry.values)}</p>
        </>
      )}
      {subscription.expiringSoon && <Alert tone="warning">{messages.usageExpiringSoon}</Alert>}
    </div>
  );
};
