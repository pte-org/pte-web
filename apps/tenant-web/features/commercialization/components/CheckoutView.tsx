"use client";

import { useMemo, type ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  CheckCircleIcon,
  LoadingState,
  PageHeader,
  useDashboardBreadcrumbLabel,
  useToast,
} from "@pte/ui";
import { getUserFacingApiErrorMessage, type OrderResponse } from "@pte/api-client";
import { useMyOrganizations } from "@/features/programs/api";
import { useCreateOrder, useOrdersQuery, useStudentQuotaQuery, useTenantPlansQuery } from "../api";
import { PLANS_HOME_HREF } from "../constants";
import { useCheckoutText } from "../hooks/useCheckoutText";
import { BillingPanel } from "./BillingPanel";
import { CheckoutNextSteps } from "./CheckoutNextSteps";
import { CheckoutSummary } from "./CheckoutSummary";

export const CheckoutView = (): ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const copy = useCheckoutText();
  const { text } = copy;
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get("planId") ?? "";
  const { data: plans = [], isLoading } = useTenantPlansQuery();
  const { data: orders = [] } = useOrdersQuery();
  const { data: organizations } = useMyOrganizations();
  const { data: quota } = useStudentQuotaQuery();
  const createOrder = useCreateOrder();
  const plan = useMemo(
    () => plans.find((item) => item.publicId === selectedPlanId && item.status === "ACTIVE"),
    [plans, selectedPlanId],
  );
  const isFreePlan = plan ? Number(plan.price) === 0 : false;
  const title = isFreePlan ? text.TITLE_FREE : text.TITLE_PAID;
  // The breadcrumb's last segment names the page, so the plan list stays one click away in its parent.
  useDashboardBreadcrumbLabel(pathname, title);
  const pendingOrder = plan
    ? orders.find((item) => item.planId === plan.publicId && item.status === "PENDING")
    : undefined;

  const startPayment = async (): Promise<void> => {
    if (!plan) return;
    let order: OrderResponse;
    try {
      order = await createOrder.mutateAsync({ planId: plan.publicId });
    } catch (error) {
      showToast(getUserFacingApiErrorMessage(error, text.ORDER_ERROR), { tone: "error" });
      return;
    }
    if (order.paymentLinkUrl) {
      window.location.assign(order.paymentLinkUrl);
      return;
    }
    router.push("/host/billing");
  };

  const freeNote = plan?.type === "EXAM_PACKAGE" ? text.FREE_NOTE_EXAM : text.FREE_NOTE_CAPACITY;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader title={title} />
      {isLoading && <LoadingState rows={3} />}
      {!isLoading && !plan && <Alert tone="warning">{text.SELECT_ACTIVE_PLAN}</Alert>}
      {pendingOrder && (
        <Alert tone="info" title={text.PENDING_TITLE}>
          {text.PENDING_TEXT}
          {pendingOrder.paymentLinkUrl && (
            <a className="ml-1 font-semibold underline" href={pendingOrder.paymentLinkUrl}>
              {text.CONTINUE_PAYMENT}
            </a>
          )}
        </Alert>
      )}
      {plan && (
        <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-5">
            <CheckoutSummary
              plan={plan}
              isFree={isFreePlan}
              organizationName={organizations?.[0]?.name}
              currentStudentLimit={quota?.limit}
              copy={copy}
            />
            <CheckoutNextSteps
              plan={plan}
              isFree={isFreePlan}
              currentStudentLimit={quota?.limit}
              copy={copy}
            />
          </div>
          <BillingPanel
            title={isFreePlan ? text.CONFIRM_TITLE : text.SECURE_PAYMENT}
            subtitle={isFreePlan ? undefined : text.POWERED_BY_PAYOS}
          >
            {/* Theme colours, so the note is a soft tint in both themes instead of a solid navy block in the dark one. */}
            <div className="rounded-lg border border-[var(--sky-action)]/25 bg-[var(--sky-tint)]/60 p-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sky-action)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--ink-primary)]">
                    {isFreePlan ? text.NO_PAYMENT_TITLE : text.PAYOS_TITLE}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-secondary)]">{isFreePlan ? freeNote : text.PAYOS_NOTE}</p>
                </div>
              </div>
            </div>
            <Button
              className="mt-5"
              fullWidth
              onClick={() => void startPayment()}
              isLoading={createOrder.isPending}
              loadingText={isFreePlan ? text.ACTIVATING : text.CREATING_ORDER}
              disabled={pendingOrder !== undefined}
            >
              {isFreePlan ? text.ACTIVATE : text.CONTINUE_PAYOS}
            </Button>
            {/* Payment status only means something once there is a pending payment; otherwise the way out is another plan. */}
            <Link
              href={
                pendingOrder
                  ? `/host/payment-status?orderId=${encodeURIComponent(pendingOrder.publicId)}`
                  : PLANS_HOME_HREF
              }
              className="mt-4 block text-center text-sm font-semibold text-action hover:underline"
            >
              {pendingOrder ? text.VIEW_STATUS : text.CHOOSE_OTHER}
            </Link>
          </BillingPanel>
        </div>
      )}
      {plan && (
        <p className="text-sm text-slate-500">
          {text.SUPPORT_LEAD}{" "}
          <Link href="/host/support-tickets" className="font-semibold text-action hover:underline">
            {text.SUPPORT_LINK}
          </Link>
        </p>
      )}
    </div>
  );
};
