"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse } from "@pte/api-client";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatNumber } from "../utils/format";
import { sectionAvailability } from "../utils/sections";
import { SectionPanel } from "./SectionPanel";

export interface CommercialCardsProps {
  dashboard: AdminDashboardResponse;
  onRetry: () => void;
  className?: string;
}

export const CommercialCards = ({
  dashboard,
  onRetry,
  className,
}: CommercialCardsProps): ReactElement | null => {
  const { locale, messages, format } = useAdminDashboardText();

  const allHidden =
    sectionAvailability(dashboard.licenses) === "forbidden" &&
    sectionAvailability(dashboard.subscriptions) === "forbidden" &&
    sectionAvailability(dashboard.plans) === "forbidden";

  if (allHidden) return null;

  return (
    <div className={className ?? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"}>
      {/* Licenses Card */}
      <SectionPanel
        title={messages.licensesTitle}
        subtitle={messages.licensesSubtitle}
        actions={
          <Link
            href={ADMIN_DASHBOARD_ROUTES.licenses}
            className="text-xs font-semibold text-action hover:underline"
          >
            {messages.licensesManage}
          </Link>
        }
        section={dashboard.licenses}
        onRetry={onRetry}
      >
        {(data) => (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{messages.licensesIssuedValid}</dt>
                <dd className="text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.issuedValid, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{messages.licensesRedeemed}</dt>
                <dd className="text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.redeemed, locale)}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-[var(--ink-secondary)]">
              {format("licensesRedeemedInWindow", {
                count: formatNumber(data.redeemedInWindow.current, locale),
                days: dashboard.meta.windowDays,
              })}
            </p>
          </div>
        )}
      </SectionPanel>

      {/* Subscriptions Card */}
      <SectionPanel
        title={messages.subscriptionsTitle}
        subtitle={messages.subscriptionsSubtitle}
        actions={
          <Link
            href={ADMIN_DASHBOARD_ROUTES.licenses}
            className="text-xs font-semibold text-action hover:underline"
          >
            {messages.subscriptionsManage}
          </Link>
        }
        section={dashboard.subscriptions}
        onRetry={onRetry}
      >
        {(data) => (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{messages.subscriptionsActive}</dt>
                <dd className="text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.active, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{messages.subscriptionsExpiringSoon}</dt>
                <dd className="text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.expiringSoon, locale)}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-[var(--ink-secondary)]">
              {format("subscriptionsActivatedInWindow", {
                count: formatNumber(data.activatedInWindow.current, locale),
                days: dashboard.meta.windowDays,
              })}
            </p>
          </div>
        )}
      </SectionPanel>

      {/* Plans Card (P3) */}
      <SectionPanel
        title={messages.plansTitle}
        subtitle={messages.plansSubtitle}
        actions={
          <Link
            href={ADMIN_DASHBOARD_ROUTES.plans}
            className="text-xs font-semibold text-action hover:underline"
          >
            {messages.plansManage}
          </Link>
        }
        section={dashboard.plans}
        onRetry={onRetry}
      >
        {(data) => (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{messages.plansActive}</dt>
                <dd className="text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.active, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{messages.plansDraft}</dt>
                <dd className="text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.draft, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{messages.plansArchived}</dt>
                <dd className="text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
                  {formatNumber(data.archived, locale)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </SectionPanel>
    </div>
  );
};
