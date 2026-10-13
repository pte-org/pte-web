"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { HostDashboardResponse } from "@pte/api-client";
import { ActivityList, Button, DashboardPanel, type ActivityListItem } from "@pte/ui";
import { ATTENTION_MESSAGE_KEYS } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import type { AttentionItem } from "../types";
import { deriveAttention } from "../utils/attention";
import { formatNumber, formatPercent } from "../utils/format";

interface NeedsAttentionPanelProps {
  dashboard: HostDashboardResponse;
  onRetry: () => void;
  className?: string;
}

/**
 * Derived from other sections' counts. Items whose source is unavailable are left out; when some
 * sources failed the panel says so and offers a retry, and when none loaded it shows an error.
 */
export const NeedsAttentionPanel = ({
  dashboard,
  onRetry,
  className,
}: NeedsAttentionPanelProps): ReactElement | null => {
  const { locale, messages, format } = useHostDashboardText();
  const { items, available, failed } = deriveAttention(dashboard);
  if (available === 0 && failed === 0) return null;

  const countText = (item: AttentionItem): string => {
    if (item.unit === "days") return format("attentionUnitDays", { count: item.count });
    if (item.unit === "percent") return formatPercent(item.count, locale);
    return formatNumber(item.count, locale);
  };
  const listItems: ActivityListItem[] = items.map((item) => ({
    id: item.kind,
    title: messages[ATTENTION_MESSAGE_KEYS[item.kind]],
    count: countText(item),
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
          ariaLabel={messages.attentionAria}
          emptyLabel={messages.attentionEmpty}
          renderLink={(props) => <Link {...props} />}
        />
        {failed > 0 && <p className="text-xs text-[var(--ink-muted)]">{messages.attentionPartial}</p>}
      </div>
    </DashboardPanel>
  );
};
