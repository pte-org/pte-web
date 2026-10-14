"use client";

import { useState, type ReactElement } from "react";
import { Alert, TabPanel, Tabs, useLocale } from "@pte/ui";
import { useStudentQuotaQuery, useSubscriptionsQuery, useTenantPlansQuery } from "../api";
import { BILLING_TEXT as T } from "../constants";
import { BillingPlanTab } from "./BillingPlanTab";
import { OrdersView } from "./OrdersView";

const PLAN_TAB_ID = "plan";
const HISTORY_TAB_ID = "history";

export const BillingOverviewView = (): ReactElement => {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState(PLAN_TAB_ID);
  const {
    data: subscriptions = [],
    isLoading: subscriptionsLoading,
    isError: subscriptionsError,
  } = useSubscriptionsQuery();
  const { data: quota, isLoading: quotaLoading, isError: quotaError } = useStudentQuotaQuery();
  const { data: plans = [] } = useTenantPlansQuery();
  const text = {
    planTab: t("tenant.billing.planTab", T.PLAN_TAB),
    transactionHistoryTab: t("tenant.billing.transactionHistoryTab", T.TRANSACTION_HISTORY_TAB),
    billingTabsAriaLabel: t("tenant.billing.billingTabsAriaLabel", T.BILLING_TABS_ARIA_LABEL),
    viewPlans: t("tenant.billing.viewPlansOnHome", T.VIEW_PLANS_ON_HOME),
    billingActions: t("tenant.billing.billingActions", T.BILLING_ACTIONS),
    currentPlan: t("tenant.billing.currentPlan", T.CURRENT_PLAN),
    currentPlanSubtitle: t("tenant.billing.currentPlanSubtitle", T.CURRENT_PLAN_SUBTITLE),
    usageStatus: t("tenant.billing.usageStatus", T.USAGE_STATUS),
    usageStatusSubtitle: t("tenant.billing.usageStatusSubtitle", T.USAGE_STATUS_SUBTITLE),
    noActiveAccess: t("tenant.billing.noActiveAccess", T.NO_ACTIVE_ACCESS),
    noActiveAccessDescription: t(
      "tenant.billing.noActiveAccessDescription",
      T.NO_ACTIVE_ACCESS_DESCRIPTION,
    ),
    accessLoadError: t("tenant.billing.accessLoadError", T.ACCESS_LOAD_ERROR),
    capacityLoadError: t("tenant.billing.capacityLoadError", T.CAPACITY_LOAD_ERROR),
    loadingAccess: t("tenant.billing.loadingAccess", T.LOADING_SUBSCRIPTIONS),
    loadingCapacity: t("tenant.billing.loadingCapacity", T.LOADING_QUOTA),
    redeemLicense: t("tenant.billing.redeemLicense", T.REDEEM_LICENSE),
  };
  const planNames = new Map(plans.map((plan) => [plan.publicId, plan.name]));
  const resolvePlanName = (planId: string): string =>
    planNames.get(planId) ?? t("tenant.billing.examPackages", T.EXAM_PACKAGES);

  return (
    <div className="flex flex-col gap-5">
      {subscriptionsError && <Alert tone="error">{text.accessLoadError}</Alert>}
      {quotaError && <Alert tone="error">{text.capacityLoadError}</Alert>}

      <Tabs
        id="billing-tabs"
        variant="default"
        items={[
          { id: PLAN_TAB_ID, label: text.planTab },
          { id: HISTORY_TAB_ID, label: text.transactionHistoryTab },
        ]}
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel={text.billingTabsAriaLabel}
      />

      <TabPanel
        id="billing-tabs-panel-plan"
        labelledBy="billing-tabs-tab-plan"
        active={activeTab === PLAN_TAB_ID}
      >
        <BillingPlanTab
          plans={plans}
          subscriptions={subscriptions}
          quota={quota}
          subscriptionsLoading={subscriptionsLoading}
          quotaLoading={quotaLoading}
          planName={resolvePlanName}
          text={text}
        />
      </TabPanel>

      <TabPanel
        id="billing-tabs-panel-history"
        labelledBy="billing-tabs-tab-history"
        active={activeTab === HISTORY_TAB_ID}
      >
        <OrdersView />
      </TabPanel>
    </div>
  );
};
