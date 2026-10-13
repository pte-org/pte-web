"use client";

import type { ReactElement } from "react";
import type { HostQuotaData } from "@pte/api-client";
import { Alert, ProgressBar } from "@pte/ui";
import { HOST_DASHBOARD_ROUTES } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { buildSeatUsage } from "../utils/usage";
import { formatNumber } from "../utils/format";
import { PanelLink } from "./PanelLink";

const FULL_PERCENT = 100;

export const SeatUsageBlock = ({ quota }: { quota: HostQuotaData }): ReactElement => {
  const { locale, messages, format } = useHostDashboardText();
  const seats = buildSeatUsage(quota);

  if (seats.percent === null) {
    return <p className="text-sm text-[var(--ink-secondary)]">{messages.usageNoSeats}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--ink-primary)]">
          {format("usageSeatsUsed", {
            used: formatNumber(seats.used, locale),
            limit: formatNumber(seats.limit, locale),
          })}
        </p>
        <p className="text-xs text-[var(--ink-secondary)]">
          {format("usageSeatsPercent", { percent: seats.percent })}
        </p>
      </div>
      <ProgressBar
        value={Math.min(seats.used, seats.limit)}
        max={seats.limit}
        tone={seats.percent >= FULL_PERCENT ? "danger" : seats.nearLimit ? "warning" : "success"}
        label={messages.usageSeatsLabel}
      />
      <p className="text-xs text-[var(--ink-muted)]">
        {format("usageRemaining", { count: formatNumber(seats.remaining, locale) })}
      </p>
      {seats.nearLimit && (
        <Alert tone="warning">
          <span className="flex flex-wrap items-center justify-between gap-2">
            {messages.usageNearLimit}
            <PanelLink href={HOST_DASHBOARD_ROUTES.billing}>{messages.usageAddCapacity}</PanelLink>
          </span>
        </Alert>
      )}
    </div>
  );
};
