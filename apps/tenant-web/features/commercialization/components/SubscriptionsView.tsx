"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, ChevronLeftIcon, EyeIcon, PageHeader } from "@pte/ui";
import { useSubscriptionsQuery } from "../api";
import { BILLING_TEXT as T } from "../constants";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";
import { RevealLicenseKeyModal } from "./RevealLicenseKeyModal";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getRemainingDays(
  expiresAt: string,
  now: number,
): { days: number; isExpired: boolean; isExpiringSoon: boolean } {
  const expiry = new Date(expiresAt).getTime();
  const diffMs = expiry - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    days,
    isExpired: days <= 0,
    isExpiringSoon: days > 0 && days <= 7,
  };
}

const SubscriptionPeriodPill = ({
  startsAt,
  expiresAt,
  now,
}: {
  startsAt: string;
  expiresAt: string;
  now: number;
}): ReactElement => {
  const { days, isExpired, isExpiringSoon } = getRemainingDays(expiresAt, now);

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
      <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-white px-2.5 py-1 font-medium text-slate-600 shadow-sm">
        <span className="text-slate-400">Started:</span>
        <span className="font-semibold text-slate-800">{formatDate(startsAt)}</span>
      </div>

      <svg
        className="h-3.5 w-3.5 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>

      <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-white px-2.5 py-1 font-medium text-slate-600 shadow-sm">
        <span className="text-slate-400">Expires:</span>
        <span className="font-semibold text-slate-800">{formatDate(expiresAt)}</span>
      </div>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium ${
          isExpired
            ? "border border-red-200 bg-red-50 text-red-700"
            : isExpiringSoon
            ? "border border-amber-200 bg-amber-50 text-amber-700"
            : "border border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isExpired ? "bg-red-500" : isExpiringSoon ? "bg-amber-500" : "bg-emerald-500"
          }`}
        />
        {isExpired
          ? "Expired"
          : isExpiringSoon
          ? `Expires in ${days} ${days === 1 ? "day" : "days"}`
          : `${days} days left`}
      </span>
    </div>
  );
};

export const SubscriptionsView = (): ReactElement => {
  const { data: subscriptions = [], isLoading, isError } = useSubscriptionsQuery();
  const [now] = useState(() => Date.now());
  const [revealTargetId, setRevealTargetId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});
  const examSubscriptions = subscriptions.filter((item) => item.maxStudentsPerSession !== null);
  const capacitySubscriptions = subscriptions.filter((item) => item.maxStudentsPerSession === null);
  const expiringSoon = examSubscriptions.filter(
    (item) => new Date(item.expiresAt).getTime() - now < 7 * 24 * 60 * 60 * 1000,
  );

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/host/billing"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span>{T.BACK_TO_PLANS}</span>
      </Link>

      <PageHeader
        title={T.ACTIVE_ACCESS_TITLE}
        subtitle={T.ACTIVE_ACCESS_SUBTITLE}
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
                  <SubscriptionPeriodPill
                    startsAt={subscription.startsAt}
                    expiresAt={subscription.expiresAt}
                    now={now}
                  />
                </div>
                <BillingStatusBadge status={subscription.status} />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Metric label={T.STUDENT_CAP} value={String(subscription.maxStudentsPerSession)} />
                <Metric label={T.ACTIVATION} value={subscription.activationSource} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{T.LICENSE_KEY}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {revealedKeys[subscription.publicId] ?? subscription.licenseKey}
                    </p>
                    <button
                      type="button"
                      aria-label={
                        revealedKeys[subscription.publicId]
                          ? T.HIDE_LICENSE_KEY
                          : T.REVEAL_LICENSE_KEY
                      }
                      onClick={() => {
                        if (revealedKeys[subscription.publicId]) {
                          setRevealedKeys((current) => {
                            const next = { ...current };
                            delete next[subscription.publicId];
                            return next;
                          });
                        } else {
                          setRevealTargetId(subscription.publicId);
                        }
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <EyeIcon closed={Boolean(revealedKeys[subscription.publicId])} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
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
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-white px-2.5 py-1 font-medium text-slate-600 shadow-sm">
                      <span className="text-slate-400">Activated:</span>
                      <span className="font-semibold text-slate-800">{formatDate(subscription.startsAt)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-medium text-blue-700">
                      Permanent
                    </span>
                  </div>
                </div>
                <BillingStatusBadge status={subscription.status} />
              </div>
            ))}
      </BillingPanel>
      <RevealLicenseKeyModal
        open={revealTargetId !== null}
        subscriptionPublicId={revealTargetId}
        onClose={() => setRevealTargetId(null)}
        onRevealed={(subscriptionPublicId, licenseKey) =>
          setRevealedKeys((current) => ({ ...current, [subscriptionPublicId]: licenseKey }))
        }
      />
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }): ReactElement => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
