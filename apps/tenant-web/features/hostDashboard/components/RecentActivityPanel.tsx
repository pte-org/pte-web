"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { ActivityList, type ActivityListItem } from "@pte/ui";
import { HOST_DASHBOARD_ROUTES } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { buildActivityRows } from "../utils/activity";
import { PanelLink } from "./PanelLink";
import { SectionPanel } from "./SectionPanel";

interface RecentActivityPanelProps {
  dashboard: HostDashboardResponse;
  onRetry: () => void;
  className?: string;
}

/** Audit timeline. The actor is only ever a generic role label: the backend sends a user id, not a name. */
export const RecentActivityPanel = ({
  dashboard,
  onRetry,
  className,
}: RecentActivityPanelProps): ReactElement | null => {
  const { locale, messages } = useHostDashboardText();

  return (
    <SectionPanel
      title={messages.activityTitle}
      subtitle={messages.activitySubtitle}
      actions={<PanelLink href={HOST_DASHBOARD_ROUTES.auditLog}>{messages.activityViewAll}</PanelLink>}
      section={dashboard.recentActivity}
      onRetry={onRetry}
      className={className}
    >
      {(items) => {
        const rows: ActivityListItem[] = buildActivityRows(items, locale, dashboard.meta.zone).map((row) => ({
          id: row.id,
          title: messages[row.titleKey],
          timeLabel: row.when || undefined,
          meta: messages[row.actorKey],
          tone: row.tone,
        }));
        return (
          <ActivityList
            variant="timeline"
            items={rows}
            ariaLabel={messages.activityAria}
            emptyLabel={messages.activityEmpty}
          />
        );
      }}
    </SectionPanel>
  );
};
