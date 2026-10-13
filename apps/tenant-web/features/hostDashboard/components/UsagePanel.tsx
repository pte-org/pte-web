"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { Button, DashboardPanel, ErrorState } from "@pte/ui";
import { HOST_DASHBOARD_ROUTES } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { sectionAvailability, sectionData } from "../utils/sections";
import { PanelLink } from "./PanelLink";
import { SeatUsageBlock } from "./SeatUsageBlock";
import { SubscriptionBlock } from "./SubscriptionBlock";

interface UsagePanelProps {
  dashboard: HostDashboardResponse;
  onRetry: () => void;
  className?: string;
}

/**
 * Seats (quota) and subscriptions share one panel but stay independent: a failed half shows its
 * own error with a retry while the other half renders; when both are hidden the panel is hidden.
 */
export const UsagePanel = ({ dashboard, onRetry, className }: UsagePanelProps): ReactElement | null => {
  const { messages } = useHostDashboardText();
  const { meta } = dashboard;
  const quotaState = sectionAvailability(dashboard.quota);
  const subscriptionState = sectionAvailability(dashboard.subscription);
  if (quotaState === "forbidden" && subscriptionState === "forbidden") return null;

  const quotaData = sectionData(dashboard.quota);
  const subscriptionData = sectionData(dashboard.subscription);
  const bothFailed = quotaState !== "ok" && subscriptionState !== "ok";

  const sectionError = (
    <ErrorState
      title={messages.sectionErrorTitle}
      description={messages.sectionErrorDescription}
      action={
        <Button variant="danger" appearance="outline" size="sm" onClick={onRetry}>
          {messages.retry}
        </Button>
      }
    />
  );

  return (
    <DashboardPanel
      title={messages.usageTitle}
      subtitle={messages.usageSubtitle}
      className={className}
      actions={<PanelLink href={HOST_DASHBOARD_ROUTES.subscriptions}>{messages.usageManage}</PanelLink>}
      status={bothFailed ? "error" : "content"}
      error={{
        title: messages.sectionErrorTitle,
        description: messages.sectionErrorDescription,
        retryLabel: messages.retry,
        onRetry,
      }}
    >
      <div className="flex flex-col gap-5">
        {quotaData ? <SeatUsageBlock quota={quotaData} /> : quotaState === "error" && sectionError}
        {subscriptionData ? (
          <SubscriptionBlock subscription={subscriptionData} timeZone={meta.zone} />
        ) : (
          subscriptionState === "error" && sectionError
        )}
      </div>
    </DashboardPanel>
  );
};
