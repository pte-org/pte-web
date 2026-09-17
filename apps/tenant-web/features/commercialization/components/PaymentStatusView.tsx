"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, CheckCircleIcon, PageHeader } from "@pte/ui";
import { useOrdersQuery } from "../api";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

const messages: Record<string, string> = {
  PENDING: "We are waiting for PayOS confirmation.",
  PAID: "Your plan is active and ready to use.",
  CANCELLED: "This order was cancelled.",
  EXPIRED: "This payment link has expired. Start a new order.",
};

export const PaymentStatusView = (): ReactElement => {
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get("orderId");
  const { data: orders = [], isLoading, isError } = useOrdersQuery(true, (query) => {
    const trackedOrderId = selectedOrderId ?? query.state.data?.[0]?.publicId;
    return query.state.data?.some((item) => item.publicId === trackedOrderId && item.status === "PENDING") ? 10_000 : false;
  });
  const order = orders.find((item) => item.publicId === selectedOrderId) ?? orders[0];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Payment status" subtitle="Payment updates come from the payment webhook." />
      {isError && <Alert tone="error">Payment status could not be loaded.</Alert>}
      {isLoading && <p className="text-sm text-slate-500">Loading payment status...</p>}
      {!isLoading && !order && <Alert tone="info">No order is available yet. Start checkout from the plan catalog.</Alert>}
      {order && <BillingPanel title={`Order ${order.orderCode}`} subtitle={`Plan ${order.planId} · ${Number(order.amount).toLocaleString()} ${order.currency}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5"><BillingStatusBadge status={order.status} /><span className="text-sm text-slate-500">Created {new Date(order.createdAt).toLocaleString()}</span></div>
        <div className="mt-6 flex items-start gap-3"><CheckCircleIcon className={`mt-0.5 h-5 w-5 shrink-0 ${order.status === "CANCELLED" || order.status === "EXPIRED" ? "text-rose-600" : "text-emerald-600"}`} /><p className="text-sm leading-6 text-slate-600">{messages[order.status] ?? "Payment state is being processed."}</p></div>
        {order.status === "PENDING" && <Alert className="mt-5" tone="info">This page refreshes payment status while the order is pending.</Alert>}
        {order.status === "PAID" && <Alert className="mt-5" tone="success">Payment confirmed. Check Active access for the subscription.</Alert>}
        {(order.status === "CANCELLED" || order.status === "EXPIRED") && <Link href={`/host/checkout?planId=${encodeURIComponent(order.planId)}`} className="mt-5 inline-flex text-sm font-semibold text-action hover:underline">Try checkout again</Link>}
      </BillingPanel>}
    </div>
  );
};
