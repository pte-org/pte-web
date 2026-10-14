"use client";

import type { ReactElement, ReactNode } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import {
  ActivityIcon,
  Button,
  CalendarIcon,
  ChartBarIcon,
  CollapsibleSection,
  StatCard,
  UsersIcon,
} from "@pte/ui";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import type { HostDashboardMessageKey } from "../messages/en";
import type { KpiKey, KpiViewModel } from "../types";
import { buildKpis } from "../utils/kpis";

interface KpiRowProps {
  dashboard: HostDashboardResponse;
  onRetry: () => void;
  className?: string;
}

const KPI_ACCENT: Record<KpiKey, "blue" | "sky" | "mint" | "cream"> = {
  totalLearners: "blue",
  activeLearners: "mint",
  sessions: "sky",
  attempts: "cream",
};

const KPI_ICON: Record<KpiKey, ReactNode> = {
  totalLearners: <UsersIcon />,
  activeLearners: <ActivityIcon />,
  sessions: <CalendarIcon />,
  attempts: <ChartBarIcon />,
};

const DIRECTION_LABEL_KEY: Record<"up" | "down" | "flat", HostDashboardMessageKey> = {
  up: "changeIncrease",
  down: "changeDecrease",
  flat: "changeNoChange",
};

/** Key figures grouped inside the operational overview; each card follows its source section's state. */
export const KpiRow = ({ dashboard, onRetry, className }: KpiRowProps): ReactElement | null => {
  const { locale, messages, format } = useHostDashboardText();
  const cards = buildKpis(dashboard, locale);
  if (cards.length === 0) return null;

  const days = dashboard.meta.windowDays;
  const hasUnavailable = cards.some((card) => card.state === "unavailable");

  const renderCard = (card: KpiViewModel): ReactElement => {
    if (card.state === "unavailable") {
      return (
        <StatCard
          key={card.key}
          label={messages[card.labelKey]}
          value={messages.emptyValue}
          icon={KPI_ICON[card.key]}
          accent={KPI_ACCENT[card.key]}
          footnote={messages.kpiUnavailable}
        />
      );
    }
    const { delta } = card;
    return (
      <StatCard
        key={card.key}
        label={messages[card.labelKey]}
        value={card.value}
        icon={KPI_ICON[card.key]}
        accent={KPI_ACCENT[card.key]}
        footnote={card.noteKey ? format(card.noteKey, card.noteValues) : undefined}
        {...(delta
          ? {
              change: delta.change,
              changeDirection: delta.direction,
              changeTone: delta.tone,
              changePeriodLabel: format("changePeriod", { days }),
              changeDirectionLabel: messages[DIRECTION_LABEL_KEY[delta.direction]],
              changeEmptyLabel: messages.changeNoPrevious,
            }
          : {})}
      />
    );
  };

  return (
    <CollapsibleSection
      className={className}
      title={messages.kpiTitle}
      subtitle={format("kpiSubtitle", { days })}
      collapsible={false}
      actions={
        hasUnavailable ? (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {messages.retry}
          </Button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(renderCard)}</div>
    </CollapsibleSection>
  );
};
