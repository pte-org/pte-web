"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, PageHeader } from "@pte/ui";
import { useSubscriptionsQuery } from "../api";
import { BILLING_TEXT as T } from "../constants";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

const mask = (value: string): string =>
  value.length > 4 ? `${T.MASKED_VALUE} ${value.slice(-4)}` : T.MASKED_VALUE;

export const SubscriptionsView = (): ReactElement => {
  const { data: subscriptions = [], isLoading, isError } = useSubscriptionsQuery();
  const [now] = useState(() => Date.now());
  const examSubscriptions = subscriptions.filter((item) => item.maxStudentsPerSession !== null);
  const capacitySubscriptions = subscriptions.filter((item) => item.maxStudentsPerSession === null);
  const expiringSoon = examSubscriptions.filter(
    (item) => new Date(item.expiresAt).getTime() - now < 7 * 24 * 60 * 60 * 1000,
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.ACTIVE_ACCESS_TITLE}
        subtitle={T.ACTIVE_ACCESS_SUBTITLE}
        actions={
          <Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">
            {T.MANAGE_PLANS}
          </Link>
        }
      />
      {isError && <Alert tone="error">{T.SUBSCRIPTIONS_LOAD_ERROR}</Alert>}
      {expiringSoon.length > 0 && <Alert tone="warning">{T.EXPIRING_SOON}</Alert>}
      <BillingPanel title={T.EXAM_SUBSCRIPTIONS} subtitle={T.EXAM_SUBSCRIPTIONS_SUBTITLE}>
        {isLoading && <p className="text-sm text-slate-500">{T.LOADING_SUBSCRIPTIONS}</p>}
        {!isLoading && examSubscriptions.length === 0 && (
          <p className="text-sm text-slate-500">
            {T.NO_EXAM_SUBSCRIPTIONS}{" "}
            <Link href="/host/billing" className="font-semibold text-action hover:underline">
              {T.BROWSE_PLANS_SENTENCE}
            </Link>
          </p>
        )}
        <div className="space-y-4">
          {examSubscriptions.map((subscription) => (
            <div
              key={subscription.publicId}
              className="rounded-lg border border-blue-100 bg-blue-50/50 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {T.PLAN(subscription.planId)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {T.SUBSCRIPTION_PERIOD(
                      new Date(subscription.startsAt).toLocaleDateString(),
                      new Date(subscription.expiresAt).toLocaleDateString(),
                    )}
                  </p>
                </div>
                <BillingStatusBadge status={subscription.status} />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Metric label={T.STUDENT_CAP} value={String(subscription.maxStudentsPerSession)} />
                <Metric label={T.ACTIVATION} value={subscription.activationSource} />
                <Metric label={T.LICENSE_KEY} value={mask(subscription.licenseKey)} />
              </div>
            </div>
          ))}
        </div>
      </BillingPanel>
      <BillingPanel title={T.CAPACITY_LEDGER} subtitle={T.CAPACITY_LEDGER_SUBTITLE}>
        {capacitySubscriptions.length === 0
          ? <p className="text-sm text-slate-500">{T.NO_CAPACITY_ADD_ONS}</p>
          : capacitySubscriptions.map((subscription) => (
              <div
                key={subscription.publicId}
                className="flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {T.PLAN(subscription.planId)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {T.ACTIVATED(new Date(subscription.startsAt).toLocaleDateString())}
                  </p>
                </div>
                <BillingStatusBadge status={subscription.status} />
              </div>
            ))}
      </BillingPanel>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }): ReactElement => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
