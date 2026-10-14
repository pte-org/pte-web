"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse } from "@pte/api-client";
import {
  ActivityList,
  BellIcon,
  Button,
  ClockIcon,
  DashboardPanel,
  DocumentIcon,
  LicenseIcon,
  type ActivityListItem,
  type BadgeVariant,
} from "@pte/ui";
import type { AdminDashboardMessageKey } from "../messages/en";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import type { AdminAttentionKind } from "../types";
import { deriveAdminAttention } from "../utils/attention";
import { sectionData } from "../utils/sections";
import { formatNumber } from "../utils/format";

export interface AdminNeedsAttentionPanelProps {
  dashboard: AdminDashboardResponse;
  onRetry: () => void;
  className?: string;
}

const ATTENTION_MESSAGE_KEYS: Record<AdminAttentionKind, AdminDashboardMessageKey> = {
  pendingApplications: "attentionPendingApplications",
  expiringSubscriptions: "attentionExpiringSubscriptions",
  expiringLicenses: "attentionExpiringLicenses",
  openTickets: "attentionOpenTickets",
};

interface AttentionCategoryConfig {
  id: string;
  kind: AdminAttentionKind;
  count: number;
  href: string;
  icon: ReactElement;
  defaultTone: BadgeVariant;
}

export const AdminNeedsAttentionPanel = ({
  dashboard,
  onRetry,
  className,
}: AdminNeedsAttentionPanelProps): ReactElement | null => {
  const { locale, messages } = useAdminDashboardText();
  const { available, failed } = deriveAdminAttention(dashboard);

  if (available === 0 && failed === 0) return null;

  const applications = sectionData(dashboard.applications);
  const subscriptions = sectionData(dashboard.subscriptions);
  const licenses = sectionData(dashboard.licenses);
  const support = sectionData(dashboard.support);

  const categories: AttentionCategoryConfig[] = [
    {
      id: "openTickets",
      kind: "openTickets",
      count: support?.open ?? 0,
      href: ADMIN_DASHBOARD_ROUTES.supportTickets,
      icon: <BellIcon className="h-4 w-4" />,
      defaultTone: "danger",
    },
    {
      id: "expiringSubscriptions",
      kind: "expiringSubscriptions",
      count: subscriptions?.expiringSoon ?? 0,
      href: ADMIN_DASHBOARD_ROUTES.subscriptions,
      icon: <ClockIcon className="h-4 w-4" />,
      defaultTone: "warning",
    },
    {
      id: "pendingApplications",
      kind: "pendingApplications",
      count: applications?.pending ?? 0,
      href: ADMIN_DASHBOARD_ROUTES.applications,
      icon: <DocumentIcon className="h-4 w-4" />,
      defaultTone: "warning",
    },
    {
      id: "expiringLicenses",
      kind: "expiringLicenses",
      count: licenses?.expiringSoon ?? 0,
      href: ADMIN_DASHBOARD_ROUTES.licenses,
      icon: <LicenseIcon className="h-4 w-4" />,
      defaultTone: "warning",
    },
  ];

  // Prioritize active issues (danger before warning), followed by healthy items (count === 0)
  const sorted = [...categories].sort((a, b) => {
    if (a.count > 0 && b.count === 0) return -1;
    if (a.count === 0 && b.count > 0) return 1;
    if (a.id === "openTickets") return -1;
    if (b.id === "openTickets") return 1;
    return 0;
  });

  const listItems: ActivityListItem[] = sorted.map((cat) => {
    const isIssue = cat.count > 0;
    const tone: BadgeVariant = isIssue ? cat.defaultTone : "success";

    return {
      id: cat.id,
      title: messages[ATTENTION_MESSAGE_KEYS[cat.kind]],
      count: formatNumber(cat.count, locale),
      tone,
      icon: cat.icon,
      href: cat.href,
    };
  });

  return (
    <DashboardPanel
      title={messages.attentionTitle}
      subtitle={messages.attentionSubtitle}
      className={className}
      contentClassName="flex-1 flex flex-col justify-start"
      status={available === 0 ? "error" : "content"}
      error={{
        title: messages.sectionErrorTitle,
        description: messages.sectionErrorDescription,
        retryLabel: messages.retry,
        onRetry,
      }}
      actions={
        available > 0 && failed > 0 ? (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {messages.retry}
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3">
        <ActivityList
          variant="actions"
          items={listItems}
          ariaLabel={messages.attentionTitle}
          emptyLabel={failed > 0 ? messages.attentionPartialEmpty : messages.attentionEmpty}
          renderLink={(props) => <Link {...props} />}
        />
        {failed > 0 && <p className="text-xs text-[var(--ink-muted)]">{messages.attentionPartial}</p>}
      </div>
    </DashboardPanel>
  );
};
