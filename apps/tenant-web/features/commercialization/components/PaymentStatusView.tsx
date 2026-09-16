"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, CheckCircleIcon, PageHeader } from "@pte/ui";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

const STATUSES = ["PENDING", "PAID", "FAILED", "EXPIRED"] as const;

export const PaymentStatusView = (): ReactElement => {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("PENDING");
  const message = {
    PENDING: "We are waiting for PayOS confirmation.",
    PAID: "Your plan is active and ready to use.",
    FAILED: "The payment could not be confirmed. You can try again.",
    EXPIRED: "This payment link has expired. Start a new order.",
  }[status];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Payment status"
        subtitle="Payment updates come from the payment webhook."
      />
      <BillingPanel title="Order ORD-2026-0018" subtitle="Exam Growth · $129">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <BillingStatusBadge status={status} />
          <span className="text-sm text-slate-500">Updated just now</span>
        </div>
        <div className="mt-6 flex items-start gap-3">
          <CheckCircleIcon
            className={`mt-0.5 h-5 w-5 shrink-0 ${status === "FAILED" ? "text-rose-600" : "text-emerald-600"}`}
          />
          <p className="text-sm leading-6 text-slate-600">{message}</p>
        </div>
        {status === "PAID" && (
          <Alert className="mt-5" tone="success">
            Subscription activated through Dec 14, 2026.
          </Alert>
        )}
        {status === "FAILED" && (
          <Link
            href="/host/checkout"
            className="mt-5 inline-flex text-sm font-semibold text-action hover:underline"
          >
            Try checkout again
          </Link>
        )}
      </BillingPanel>
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Preview status
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`rounded-md px-3 py-2 text-xs font-semibold ${status === option ? "bg-action text-white" : "bg-white text-slate-600"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
