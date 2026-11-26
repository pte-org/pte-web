"use client";

import type { ReactElement } from "react";
import type { PlanResponse } from "@pte/api-client";
import { CheckCircleIcon, useLocale } from "@pte/ui";
import type { CheckoutText } from "../hooks/useCheckoutText";
import { BillingPanel } from "./BillingPanel";

interface CheckoutNextStepsProps {
  plan: PlanResponse;
  isFree: boolean;
  currentStudentLimit?: number;
  copy: CheckoutText;
}

/** What the plan does once it is active: only facts that hold for this kind of plan, so the person can confirm calmly. */
function nextSteps(
  plan: PlanResponse,
  isFree: boolean,
  currentStudentLimit: number | undefined,
  copy: CheckoutText,
  count: (value: number) => string,
): string[] {
  const { text, format } = copy;
  const steps: string[] = [];
  if (plan.type === "STUDENT_CAPACITY") {
    const extra = plan.extraStudentSlots;
    if (extra) {
      steps.push(
        currentStudentLimit === undefined
          ? format("NEXT_LIMIT_ADD", { extra: count(extra) })
          : format("NEXT_LIMIT", {
              current: count(currentStudentLimit),
              after: count(currentStudentLimit + extra),
            }),
      );
    }
    steps.push(text.NEXT_PERMANENT);
  } else {
    steps.push(isFree ? text.NEXT_EXAM_FREE : text.NEXT_EXAM_PAID);
    if (plan.durationDays) steps.push(format("NEXT_EXAM_DURATION", { days: plan.durationDays }));
  }
  steps.push(text.NEXT_HISTORY);
  return steps;
}

export const CheckoutNextSteps = ({
  plan,
  isFree,
  currentStudentLimit,
  copy,
}: CheckoutNextStepsProps): ReactElement => {
  const { locale } = useLocale();
  const count = (value: number): string => value.toLocaleString(locale === "vi" ? "vi-VN" : "en-US");

  return (
    <BillingPanel title={copy.text.NEXT_TITLE}>
      <ul className="flex flex-col gap-3 text-sm text-slate-700">
        {nextSteps(plan, isFree, currentStudentLimit, copy, count).map((step) => (
          <li key={step} className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </BillingPanel>
  );
};
