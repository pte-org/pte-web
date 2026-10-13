"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { HOST_DASHBOARD_ROUTES } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { formatNumber } from "../utils/format";
import { sectionAvailability } from "../utils/sections";
import { CompactMetricPanel } from "./CompactMetricPanel";

interface CompactCardsProps {
  dashboard: HostDashboardResponse;
  onRetry: () => void;
  className?: string;
}

/**
 * P3 cards: staff coverage, academic structure, the tenant's own support tickets and pending
 * orders. Orders show a count and link to the orders screen; no payment link exists in the data.
 */
export const CompactCards = ({ dashboard, onRetry, className }: CompactCardsProps): ReactElement | null => {
  const { locale, messages } = useHostDashboardText();
  const count = (value: number): string => formatNumber(value, locale);
  const allHidden = [dashboard.staff, dashboard.academics, dashboard.support, dashboard.billing].every(
    (section) => sectionAvailability(section) === "forbidden",
  );
  if (allHidden) return null;

  return (
    <div className={className}>
      <div className="grid h-full grid-cols-1 gap-5 sm:grid-cols-2">
        <CompactMetricPanel
          title={messages.staffTitle}
          section={dashboard.staff}
          onRetry={onRetry}
          href={HOST_DASHBOARD_ROUTES.examStaff}
          linkLabel={messages.staffManage}
          rows={(data) => [
            { label: messages.staffProctors, value: count(data.proctors) },
            { label: messages.staffExaminers, value: count(data.examiners) },
          ]}
        />
        <CompactMetricPanel
          title={messages.academicsTitle}
          section={dashboard.academics}
          onRetry={onRetry}
          href={HOST_DASHBOARD_ROUTES.programs}
          linkLabel={messages.academicsManage}
          rows={(data) => [
            { label: messages.academicsOrganizations, value: count(data.organizations) },
            { label: messages.academicsPrograms, value: count(data.programs) },
            { label: messages.academicsClasses, value: count(data.activeClasses) },
          ]}
        />
        <CompactMetricPanel
          title={messages.supportTitle}
          section={dashboard.support}
          onRetry={onRetry}
          href={HOST_DASHBOARD_ROUTES.supportTickets}
          linkLabel={messages.supportManage}
          rows={(data) => [
            { label: messages.supportOpen, value: count(data.open) },
            { label: messages.supportInProgress, value: count(data.inProgress) },
            { label: messages.supportResolved, value: count(data.resolvedAwaitingClose) },
          ]}
        />
        <CompactMetricPanel
          title={messages.ordersTitle}
          section={dashboard.billing}
          onRetry={onRetry}
          href={HOST_DASHBOARD_ROUTES.orders}
          linkLabel={messages.ordersManage}
          rows={(data) => [{ label: messages.ordersPending, value: count(data.pendingOrders) }]}
        />
      </div>
    </div>
  );
};
