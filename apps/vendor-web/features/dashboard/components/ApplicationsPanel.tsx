"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse } from "@pte/api-client";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatDate } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

export interface ApplicationsPanelProps {
  section: AdminDashboardResponse["applications"];
  onRetry: () => void;
  className?: string;
}

export const ApplicationsPanel = ({
  section,
  onRetry,
  className,
}: ApplicationsPanelProps): ReactElement | null => {
  const { locale, messages } = useAdminDashboardText();

  return (
    <SectionPanel
      title={messages.applicationsTitle}
      subtitle={messages.applicationsSubtitle}
      actions={
        <Link
          href={ADMIN_DASHBOARD_ROUTES.applications}
          className="text-xs font-semibold text-action hover:underline"
        >
          {messages.applicationsViewAll}
        </Link>
      }
      section={section}
      onRetry={onRetry}
      className={className}
      emptyWhen={(data) =>
        data.oldestPending.length === 0
          ? { title: messages.applicationsEmpty }
          : null
      }
    >
      {(data) => (
        <ul className="flex flex-col divide-y divide-[var(--shell-border)]">
          {data.oldestPending.map((app) => (
            <li key={app.applicationId} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0 pr-2">
                <Link
                  href={ADMIN_DASHBOARD_ROUTES.applicationDetail(app.applicationId)}
                  className="block truncate text-sm font-medium text-[var(--ink-primary)] hover:underline"
                >
                  {app.orgName}
                </Link>
                <span className="block text-xs text-[var(--ink-muted)]">
                  {app.requestedCode} · {app.orgType}
                </span>
              </div>
              <span className="shrink-0 text-xs text-[var(--ink-secondary)]">
                {formatDate(app.receivedAt, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionPanel>
  );
};
