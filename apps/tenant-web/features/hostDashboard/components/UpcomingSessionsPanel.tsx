"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { HostDashboardResponse } from "@pte/api-client";
import { Badge, DataTable, type DataTableColumn } from "@pte/ui";
import {
  HOST_DASHBOARD_ROUTES,
  SESSION_STATUS_BADGE_VARIANT,
  SESSION_STATUS_MESSAGE_KEYS,
} from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import type { UpcomingSessionRow } from "../types";
import { buildUpcomingRows } from "../utils/charts";
import { formatNumber } from "../utils/format";
import { PanelLink } from "./PanelLink";
import { SectionPanel } from "./SectionPanel";

interface UpcomingSessionsPanelProps {
  dashboard: HostDashboardResponse;
  onRetry: () => void;
  className?: string;
}

export const UpcomingSessionsPanel = ({
  dashboard,
  onRetry,
  className,
}: UpcomingSessionsPanelProps): ReactElement | null => {
  const { locale, messages, format } = useHostDashboardText();
  const dash = messages.emptyValue;

  const columns: DataTableColumn<UpcomingSessionRow>[] = [
    {
      key: "name",
      header: messages.columnSession,
      cell: (row) => (
        <Link href={HOST_DASHBOARD_ROUTES.session(row.publicId)} className="font-medium text-action hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      key: "status",
      header: messages.columnStatus,
      cell: (row) => (
        <Badge variant={SESSION_STATUS_BADGE_VARIANT[row.status]}>
          {messages[SESSION_STATUS_MESSAGE_KEYS[row.status]]}
        </Badge>
      ),
    },
    { key: "opens", header: messages.columnOpens, cell: (row) => row.opens || dash },
    { key: "closes", header: messages.columnCloses, cell: (row) => row.closes || dash },
    {
      key: "enrolled",
      header: messages.columnEnrolled,
      cell: (row) =>
        format("enrolledOfCapacity", {
          enrolled: formatNumber(row.enrolled, locale),
          capacity: row.capacity === null ? dash : formatNumber(row.capacity, locale),
        }),
    },
  ];

  return (
    <SectionPanel
      title={messages.upcomingTitle}
      subtitle={messages.upcomingSubtitle}
      actions={<PanelLink href={HOST_DASHBOARD_ROUTES.exams}>{messages.viewAll}</PanelLink>}
      section={dashboard.exams}
      onRetry={onRetry}
      className={className}
      emptyWhen={(data) =>
        data.upcoming.length === 0
          ? { title: messages.upcomingEmptyTitle, description: messages.upcomingEmptyDescription }
          : null
      }
    >
      {(data) => (
        <DataTable
          columns={columns}
          rows={buildUpcomingRows(data.upcoming, locale, dashboard.meta.zone)}
          getRowKey={(row) => row.publicId}
          showSearch={false}
          clientSidePagination={false}
          clientSideFiltering={false}
        />
      )}
    </SectionPanel>
  );
};
