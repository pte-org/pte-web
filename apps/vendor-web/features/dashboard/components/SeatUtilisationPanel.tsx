"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse } from "@pte/api-client";
import { ProgressBar, type ProgressTone } from "@pte/ui";
import { SEAT_NEAR_LIMIT_PERCENT } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatNumber } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

export interface SeatUtilisationPanelProps {
  section: AdminDashboardResponse["learners"];
  onRetry: () => void;
  className?: string;
}

export const SeatUtilisationPanel = ({
  section,
  onRetry,
  className,
}: SeatUtilisationPanelProps): ReactElement | null => {
  const { locale, messages, format } = useAdminDashboardText();

  return (
    <SectionPanel
      title={messages.utilisationTitle}
      subtitle={messages.utilisationSubtitle}
      section={section}
      onRetry={onRetry}
      className={className}
      contentClassName="flex-1 flex flex-col justify-start"
      emptyWhen={(data) =>
        data.topUtilisation.length === 0
          ? { title: messages.utilisationEmpty }
          : null
      }
    >
      {(data) => (
        <ul className="flex flex-col gap-4">
          {data.topUtilisation.map((tenant) => {
            const tone: ProgressTone =
              tenant.utilisationPct >= SEAT_NEAR_LIMIT_PERCENT
                ? "danger"
                : tenant.utilisationPct >= 75
                  ? "warning"
                  : "success";

            return (
              <li key={tenant.tenantId} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-[var(--ink-primary)]">
                    {tenant.name}
                  </span>
                  <span className="font-semibold tabular-nums text-[var(--ink-secondary)]">
                    {format("utilisationPctLabel", {
                      percent: tenant.utilisationPct.toFixed(1),
                    })}
                  </span>
                </div>
                <ProgressBar
                  value={Math.min(tenant.students, tenant.seatLimit)}
                  max={tenant.seatLimit}
                  tone={tone}
                  label={tenant.name}
                />
                <span className="text-xs text-[var(--ink-muted)]">
                  {format("utilisationFraction", {
                    used: formatNumber(tenant.students, locale),
                    limit: formatNumber(tenant.seatLimit, locale),
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SectionPanel>
  );
};
