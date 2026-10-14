"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse } from "@pte/api-client";
import { StatCard, type StatCardDeltaDirection } from "@pte/ui";
import type { AdminDashboardMessageKey } from "../messages/en";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { buildAdminKpis } from "../utils/kpis";

export interface AdminKpiRowProps {
  dashboard: AdminDashboardResponse;
  className?: string;
}

const DIRECTION_LABEL_KEY: Record<StatCardDeltaDirection, AdminDashboardMessageKey> = {
  up: "changeIncrease",
  down: "changeDecrease",
  flat: "changeNoChange",
};

export const AdminKpiRow = ({ dashboard, className }: AdminKpiRowProps): ReactElement | null => {
  const { locale, messages, format } = useAdminDashboardText();
  const cards = buildAdminKpis(dashboard, locale);
  const days = dashboard.meta.windowDays;

  if (cards.length === 0) return null;

  return (
    <div className={className ?? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
      {cards.map((card) => {
        const label = messages[card.labelKey];
        if (card.state === "unavailable") {
          return (
            <StatCard
              key={card.key}
              label={label}
              value={messages.dash}
              footnote={messages.kpiUnavailable}
            />
          );
        }

        const footnote = card.noteKey ? format(card.noteKey, card.noteValues) : undefined;
        const { delta } = card;

        return (
          <StatCard
            key={card.key}
            label={label}
            value={card.value ?? messages.dash}
            footnote={footnote}
            {...(delta
              ? {
                  change: delta.change,
                  changeDirection: delta.direction,
                  changeTone: delta.tone,
                  changePeriodLabel: format("changePeriod", { days }),
                  changeDirectionLabel: messages[DIRECTION_LABEL_KEY[delta.direction]],
                  changeNoPreviousLabel: messages.changeNoPrevious,
                }
              : {})}
          />
        );
      })}
    </div>
  );
};
