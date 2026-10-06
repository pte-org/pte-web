"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, CheckCircleIcon, PageHeader } from "@pte/ui";
import { useOrderQuery } from "../api";
import { BILLING_TEXT as T, PAYMENT_STATE_MESSAGES } from "../constants";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

export const PaymentStatusView = (): ReactElement => {
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get("orderId");
  const exactOrderQuery = useOrderQuery(selectedOrderId, Boolean(selectedOrderId));
  const order = exactOrderQuery.data;
  const isLoading = exactOrderQuery.isLoading;
  const isError = exactOrderQuery.isError;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.PAYMENT_STATUS_TITLE} subtitle={T.PAYMENT_STATUS_SUBTITLE} />
      {isError && <Alert tone="error">{T.PAYMENT_STATUS_ERROR}</Alert>}
      {isLoading && <p className="text-sm text-slate-500">{T.LOADING_PAYMENT_STATUS}</p>}
      {!isLoading && !order && (
        <Alert tone="info">{selectedOrderId ? T.ORDER_UNAVAILABLE : T.NO_ORDER_SELECTED}</Alert>
      )}
      {order && (
        <BillingPanel
          title={T.ORDER(order.orderCode)}
          subtitle={T.ORDER_PLAN_SUBTITLE(
            order.planId,
            Number(order.amount).toLocaleString(),
            order.currency,
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <BillingStatusBadge status={order.status} />
            <span className="text-sm text-slate-500">
              {T.CREATED(new Date(order.createdAt).toLocaleString())}
            </span>
          </div>
          <div className="mt-6 flex items-start gap-3">
            <CheckCircleIcon
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                order.status === "CANCELLED" || order.status === "EXPIRED"
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            />
            <p className="text-sm leading-6 text-slate-600">
              {PAYMENT_STATE_MESSAGES[order.status] ?? T.PAYMENT_PROCESSING}
            </p>
          </div>
          {order.status === "PENDING" && (
            <Alert className="mt-5" tone="info">
              {T.PENDING_STATUS_NOTICE}
            </Alert>
          )}
          {order.status === "PAID" && (
            <Alert className="mt-5" tone="success">
              {T.PAYMENT_CONFIRMED}
            </Alert>
          )}
          {(order.status === "CANCELLED" || order.status === "EXPIRED") && (
            <Link
              href={`/host/checkout?planId=${encodeURIComponent(order.planId)}`}
              className="mt-5 inline-flex text-sm font-semibold text-action hover:underline"
            >
              {T.TRY_CHECKOUT_AGAIN}
            </Link>
          )}
        </BillingPanel>
      )}
    </div>
  );
};
