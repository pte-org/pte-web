"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, CheckCircleIcon, PageHeader } from "@pte/ui";
import { BillingPanel } from "./BillingPanel";

export const CheckoutView = (): ReactElement => {
  const [started, setStarted] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/host/billing" className="text-sm font-medium text-action hover:underline">
        &larr; Back to plans
      </Link>
      <PageHeader
        title="Checkout"
        subtitle="Review your order before opening the secure payment page."
      />
      {started && (
        <Alert tone="info" title="Payment page ready">
          Continue in PayOS, then return here while the webhook confirms your payment.
        </Alert>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <BillingPanel title="Order summary" subtitle="Selected package">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-base font-semibold text-slate-900">Exam Growth</p>
              <p className="mt-1 text-sm text-slate-500">90 days · Up to 2,000 students / exam</p>
            </div>
            <p className="text-xl font-bold text-slate-950">$129</p>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Package price</span>
              <span>$129</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900">
              <span>Total</span>
              <span>$129</span>
            </div>
          </div>
        </BillingPanel>
        <BillingPanel title="Secure payment" subtitle="Powered by PayOS">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-blue-700">
                <CheckCircleIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">PayOS checkout</p>
                <p className="mt-1 text-xs text-slate-600">
                  Payment status is confirmed by webhook.
                </p>
              </div>
            </div>
          </div>
          <Button className="mt-5" fullWidth onClick={() => setStarted(true)}>
            Continue to PayOS
          </Button>
          <Link
            href="/host/payment-status"
            className="mt-4 block text-center text-sm font-semibold text-action hover:underline"
          >
            View payment status
          </Link>
        </BillingPanel>
      </div>
    </div>
  );
};
