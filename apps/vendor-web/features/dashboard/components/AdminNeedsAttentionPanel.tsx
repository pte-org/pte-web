"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse } from "@pte/api-client";
import { ActivityList, Button, DashboardPanel, type ActivityListItem } from "@pte/ui";
import type { AdminDashboardMessageKey } from "../messages/en";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import type { AdminAttentionKind } from "../types";
import { deriveAdminAttention } from "../utils/attention";
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

export const AdminNeedsAttentionPanel = ({
  dashboard,
  onRetry,
  className,
}: AdminNeedsAttentionPanelProps): ReactElement | null => {
  const { locale, messages } = useAdminDashboardText();
  const { items, available, failed } = deriveAdminAttention(dashboard);

  if (available === 0 && failed === 0) return null;

  const listItems: ActivityListItem[] = items.map((item) => ({
    id: item.id,
    title: messages[ATTENTION_MESSAGE_KEYS[item.kind]],
    count: formatNumber(item.count, locale),
    tone: item.tone,
    href: item.href,
  }));

  return (
    <DashboardPanel
      title={messages.attentionTitle}
      subtitle={messages.attentionSubtitle}
      className={className}
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
