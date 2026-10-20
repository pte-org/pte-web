"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, CheckCircleIcon, ChevronRightIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { useHomeCopy } from "../useHomeCopy";
import type { HomePlan } from "./homePlanPresentation";

interface HomePlanCardProps {
  plan: HomePlan;
  isOrganizationRegistered: boolean;
  isActive: boolean;
}

export const HomePlanCard = ({
  plan,
  isOrganizationRegistered,
  isActive,
}: HomePlanCardProps): ReactElement => {
  const router = useRouter();
  const { HOME_TEXT, locale } = useHomeCopy();
  const actionHref = isActive
    ? "/host/billing"
    : isOrganizationRegistered
      ? `/host/checkout?planId=${encodeURIComponent(plan.publicId)}`
      : AUTH_ROUTES.register;
  const actionLabel = isActive
    ? HOME_TEXT.currentlyUsing
    : isOrganizationRegistered
      ? HOME_TEXT.choosePlan
      : HOME_TEXT.register;
  return (
    <article
      className={`flex h-full min-w-0 flex-col rounded-xl border bg-white p-6 sm:p-8 ${isActive ? "border-action ring-1 ring-action" : "border-[var(--home-border)]"}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-action">{plan.label}</p>
        {isActive && <Badge variant="success">{HOME_TEXT.currentlyUsing}</Badge>}
      </div>
      <h3 className="break-words text-xl font-semibold tracking-tight text-[var(--home-navy)]">
        {plan.name}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
      <div className="my-7">
        <p className="flex flex-wrap items-baseline gap-2 text-[var(--home-navy)]">
          <span className="break-all text-4xl font-semibold tracking-tight tabular-nums">
            {Number(plan.price).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
          </span>
          <span className="text-sm text-slate-500">{plan.currency}</span>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {plan.durationDays ? HOME_TEXT.duration(plan.durationDays) : HOME_TEXT.permanent}
        </p>
      </div>
      <p className="border-t border-[var(--home-border)] pt-6 text-sm font-semibold text-[var(--home-navy)]">
        {plan.audience}
      </p>
      <ul className="mb-8 mt-5 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
            <CheckCircleIcon className="mt-1 h-4 w-4 shrink-0 text-action" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={isActive ? "secondary" : "primary"}
        fullWidth
        rightIcon={<ChevronRightIcon className="h-4 w-4" />}
        className="mt-auto"
        onClick={() => router.push(actionHref)}
      >
        {actionLabel}
      </Button>
    </article>
  );
};
