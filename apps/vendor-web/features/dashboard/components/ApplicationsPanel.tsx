"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse } from "@pte/api-client";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatDate, formatNumber } from "../utils/format";
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
      footerAction={
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
      contentClassName="flex-1 flex flex-col justify-between gap-4"
      emptyWhen={(data) =>
        data.oldestPending.length === 0
          ? { title: messages.applicationsEmpty }
          : null
      }
    >
      {(data) => (
        <div className="flex h-full flex-col justify-between gap-4">
          <ul className="flex flex-col gap-2.5">
            {data.oldestPending.map((app) => (
              <li
                key={app.applicationId}
                className="flex items-center justify-between rounded-xl border border-[var(--shell-border)]/60 bg-[var(--surface-subtle)]/40 p-3.5 transition-colors hover:bg-[var(--surface-subtle)]/80"
              >
                <div className="min-w-0 pr-3">
                  <Link
                    href={ADMIN_DASHBOARD_ROUTES.applicationDetail(app.applicationId)}
                    className="block truncate text-sm font-semibold text-[var(--ink-primary)] hover:underline"
                  >
                    {app.orgName}
                  </Link>
                  <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                    {app.requestedCode} · {app.orgType}
                  </span>
                </div>
                <span className="shrink-0 text-xs font-medium text-[var(--ink-secondary)]">
                  {formatDate(app.receivedAt, locale)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between border-t border-[var(--shell-border)]/60 pt-3 text-xs text-[var(--ink-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
              <span>{messages.applicationsTotalPending}</span>
              <strong className="font-semibold tabular-nums text-[var(--ink-primary)]">
                {formatNumber(data.pending, locale)}
              </strong>
            </span>
          </div>
        </div>
      )}
    </SectionPanel>
  );
};
