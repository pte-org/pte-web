"use client";

import { useMemo, type ReactElement } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, Button, CheckCircleIcon, PageHeader } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useCreateOrder, useOrdersQuery, useTenantPlansQuery } from "../api";
import { BillingPanel } from "./BillingPanel";

export const CheckoutView = (): ReactElement => {
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get("planId") ?? "";
  const { data: plans = [], isLoading } = useTenantPlansQuery();
  const { data: orders = [] } = useOrdersQuery();
  const createOrder = useCreateOrder();
  const plan = useMemo(() => plans.find((item) => item.publicId === selectedPlanId && item.status === "ACTIVE"), [plans, selectedPlanId]);
  const error = createOrder.error;
  const errorMessage = error
    ? getUserFacingApiErrorMessage(error, "The order could not be created.")
    : undefined;
  const pendingOrder = plan ? orders.find((item) => item.planId === plan.publicId && item.status === "PENDING") : undefined;

  const startPayment = async (): Promise<void> => {
    if (!plan) return;
    const order = await createOrder.mutateAsync({ planId: plan.publicId });
    if (order.paymentLinkUrl) window.location.assign(order.paymentLinkUrl);
  };

  return (
    <div className="flex flex-col gap-5">
      <Link href="/host/billing" className="text-sm font-medium text-action hover:underline">&larr; Back to plans</Link>
      <PageHeader title="Checkout" subtitle="Review your order before opening the secure payment page." />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {!isLoading && !plan && <Alert tone="warning">Select an active plan from the catalog before checking out.</Alert>}
      {pendingOrder && <Alert tone="info" title="A payment for this plan is already pending">Finish the existing payment instead of creating a duplicate order.{pendingOrder.paymentLinkUrl && <a className="ml-1 font-semibold underline" href={pendingOrder.paymentLinkUrl}>Continue payment</a>}</Alert>}
      {plan && <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <BillingPanel title="Order summary" subtitle="Selected package">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5"><div><p className="text-base font-semibold text-slate-900">{plan.name}</p><p className="mt-1 text-sm text-slate-500">{plan.durationDays ? `${plan.durationDays} days` : "Permanent add-on"} · {plan.type === "EXAM_PACKAGE" ? `Up to ${plan.maxStudentsPerSession ?? "—"} students / session` : `+${plan.extraStudentSlots ?? "—"} students`}</p></div><p className="text-xl font-bold text-slate-950">{Number(plan.price).toLocaleString()} {plan.currency}</p></div>
          <div className="mt-5 flex justify-between text-sm font-semibold text-slate-900"><span>Total</span><span>{Number(plan.price).toLocaleString()} {plan.currency}</span></div>
        </BillingPanel>
        <BillingPanel title="Secure payment" subtitle="Powered by PayOS">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-blue-700"><CheckCircleIcon className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-slate-900">PayOS checkout</p><p className="mt-1 text-xs text-slate-600">Payment status is confirmed by the webhook.</p></div></div></div>
          <Button className="mt-5" fullWidth onClick={() => void startPayment()} isLoading={createOrder.isPending} loadingText="Creating order..." disabled={pendingOrder !== undefined}>Continue to PayOS</Button>
          <Link href="/host/payment-status" className="mt-4 block text-center text-sm font-semibold text-action hover:underline">View payment status</Link>
        </BillingPanel>
      </div>}
    </div>
  );
};
