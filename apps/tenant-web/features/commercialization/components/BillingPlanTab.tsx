"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { PlanResponse, StudentQuotaResponse, SubscriptionResponse } from "@pte/api-client";
import { ActionMenu, DocumentIcon, EmptyState, LoadingState } from "@pte/ui";
import { PLANS_HOME_HREF } from "../constants";
import { BillingAccessCard } from "./BillingAccessCard";
import { BillingCapacitySummary } from "./BillingCapacitySummary";
import { BillingExpiryStatus } from "./BillingExpiryStatus";
import { BillingPanel } from "./BillingPanel";

interface BillingPlanTabText {
  currentPlan: string;
  currentPlanSubtitle: string;
  usageStatus: string;
  usageStatusSubtitle: string;
  noActiveAccess: string;
  noActiveAccessDescription: string;
  loadingAccess: string;
  loadingCapacity: string;
  capacityLoadError: string;
  viewPlans: string;
  billingActions: string;
  redeemLicense: string;
}

interface BillingPlanTabProps {
  plans: PlanResponse[];
  subscriptions: SubscriptionResponse[];
  quota?: StudentQuotaResponse;
  subscriptionsLoading: boolean;
  quotaLoading: boolean;
  planName: (planId: string) => string;
  text: BillingPlanTabText;
}

const groupSubscriptionsByPlan = (
  subscriptions: SubscriptionResponse[],
): SubscriptionResponse[][] => {
  const groups = new Map<string, SubscriptionResponse[]>();
  subscriptions.forEach((subscription) => {
    const group = groups.get(subscription.planId) ?? [];
    group.push(subscription);
    groups.set(subscription.planId, group);
  });
  return Array.from(groups.values());
};

export const BillingPlanTab = ({
  plans,
  subscriptions,
  quota,
  subscriptionsLoading,
  quotaLoading,
  planName,
  text,
}: BillingPlanTabProps): ReactElement => {
  const activeExamSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.status === "ACTIVE" && subscription.maxStudentsPerSession !== null,
  );
  const groupedExamSubscriptions = groupSubscriptionsByPlan(activeExamSubscriptions);
  const plansById = new Map(plans.map((plan) => [plan.publicId, plan]));

  return (
    <div className="flex flex-col gap-5">
      <BillingPanel
        title={text.currentPlan}
        subtitle={text.currentPlanSubtitle}
        actions={
          <ActionMenu
            label={text.billingActions}
            items={[
              { label: text.redeemLicense, href: "/host/redeem-license", icon: DocumentIcon },
            ]}
          />
        }
      >
        {subscriptionsLoading ? (
          <LoadingState rows={2} label={text.loadingAccess} />
        ) : activeExamSubscriptions.length === 0 ? (
          <EmptyState
            title={text.noActiveAccess}
            description={text.noActiveAccessDescription}
            action={
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  href={PLANS_HOME_HREF}
                  className="font-semibold text-[var(--action)] hover:underline"
                >
                  {text.viewPlans}
                </Link>
                <Link
                  href="/host/redeem-license"
                  className="font-semibold text-[var(--action)] hover:underline"
                >
                  {text.redeemLicense}
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid gap-4">
            {groupedExamSubscriptions.map((group) => (
              <BillingAccessCard
                key={group[0].planId}
                plan={plansById.get(group[0].planId)}
                planName={planName(group[0].planId)}
              />
            ))}
          </div>
        )}
      </BillingPanel>

      <BillingPanel title={text.usageStatus} subtitle={text.usageStatusSubtitle}>
        <div className="divide-y divide-[var(--divider)]">
          {subscriptionsLoading ? (
            <LoadingState rows={2} label={text.loadingAccess} />
          ) : activeExamSubscriptions.length === 0 ? (
            <EmptyState
              className="shadow-none"
              title={text.noActiveAccess}
              description={text.noActiveAccessDescription}
            />
          ) : (
            groupedExamSubscriptions.map((group) => (
              <BillingExpiryStatus
                key={group[0].planId}
                planName={planName(group[0].planId)}
                subscriptions={group}
              />
            ))
          )}
          {quotaLoading ? (
            <div className="py-4">
              <LoadingState rows={2} label={text.loadingCapacity} />
            </div>
          ) : quota ? (
            <BillingCapacitySummary quota={quota} />
          ) : (
            <p className="py-4 text-sm text-[var(--ink-secondary)]">{text.capacityLoadError}</p>
          )}
        </div>
      </BillingPanel>
    </div>
  );
};
