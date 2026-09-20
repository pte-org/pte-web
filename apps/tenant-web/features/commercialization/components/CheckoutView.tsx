"use client";

import { useMemo, type ReactElement } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, Button, CheckCircleIcon, PageHeader } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useCreateOrder, useOrdersQuery, useTenantPlansQuery } from "../api";
import { BILLING_TEXT as T } from "../constants";
import { BillingPanel } from "./BillingPanel";

export const CheckoutView = (): ReactElement => {
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get("planId") ?? "";
  const { data: plans = [], isLoading } = useTenantPlansQuery();
  const { data: orders = [] } = useOrdersQuery();
  const createOrder = useCreateOrder();
  const plan = useMemo(
    () => plans.find((item) => item.publicId === selectedPlanId && item.status === "ACTIVE"),
    [plans, selectedPlanId],
  );
  const error = createOrder.error;
  const errorMessage = error
    ? getUserFacingApiErrorMessage(error, T.ORDER_ERROR)
    : undefined;
  const pendingOrder = plan
    ? orders.find((item) => item.planId === plan.publicId && item.status === "PENDING")
    : undefined;

  const startPayment = async (): Promise<void> => {
    if (!plan) return;
    const order = await createOrder.mutateAsync({ planId: plan.publicId });
    if (order.paymentLinkUrl) window.location.assign(order.paymentLinkUrl);
  };

  return (
    <div className="flex flex-col gap-5">
      <Link href="/host/billing" className="text-sm font-medium text-action hover:underline">
        {T.BACK_TO_PLANS}
      </Link>
      <PageHeader title={T.CHECKOUT_TITLE} subtitle={T.CHECKOUT_SUBTITLE} />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {!isLoading && !plan && <Alert tone="warning">{T.SELECT_ACTIVE_PLAN}</Alert>}
      {pendingOrder && (
        <Alert tone="info" title={T.PENDING_PAYMENT_TITLE}>
          {T.PENDING_PAYMENT_TEXT}
          {pendingOrder.paymentLinkUrl && (
            <a className="ml-1 font-semibold underline" href={pendingOrder.paymentLinkUrl}>
              {T.CONTINUE_PAYMENT}
            </a>
          )}
        </Alert>
      )}
      {plan && (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <BillingPanel title={T.ORDER_SUMMARY} subtitle={T.SELECTED_PACKAGE}>
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-base font-semibold text-slate-900">{plan.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {plan.durationDays ? T.PLAN_DURATION(plan.durationDays) : T.PERMANENT_ADD_ON} ·{" "}
                  {plan.type === "EXAM_PACKAGE"
                    ? T.UP_TO_STUDENTS(plan.maxStudentsPerSession ?? T.EMPTY_VALUE)
                    : T.EXTRA_STUDENTS(plan.extraStudentSlots ?? T.EMPTY_VALUE)}
                </p>
              </div>
              <p className="text-xl font-bold text-slate-950">
                {Number(plan.price).toLocaleString()} {plan.currency}
              </p>
            </div>
            <div className="mt-5 flex justify-between text-sm font-semibold text-slate-900">
              <span>{T.TOTAL}</span>
              <span>
                {Number(plan.price).toLocaleString()} {plan.currency}
              </span>
            </div>
          </BillingPanel>
          <BillingPanel title={T.SECURE_PAYMENT} subtitle={T.POWERED_BY_PAYOS}>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-blue-700">
                  <CheckCircleIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{T.PAYOS_CHECKOUT}</p>
                  <p className="mt-1 text-xs text-slate-600">{T.WEBHOOK_CONFIRMATION}</p>
                </div>
              </div>
            </div>
            <Button
              className="mt-5"
              fullWidth
              onClick={() => void startPayment()}
              isLoading={createOrder.isPending}
              loadingText={T.CREATING_ORDER}
              disabled={pendingOrder !== undefined}
            >
              {T.CONTINUE_TO_PAYOS}
            </Button>
            <Link
              href="/host/payment-status"
              className="mt-4 block text-center text-sm font-semibold text-action hover:underline"
            >
              {T.VIEW_PAYMENT_STATUS}
            </Link>
          </BillingPanel>
        </div>
      )}
    </div>
  );
};
