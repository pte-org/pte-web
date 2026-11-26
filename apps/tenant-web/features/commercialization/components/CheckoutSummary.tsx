"use client";

import type { ReactElement, ReactNode } from "react";
import type { PlanResponse } from "@pte/api-client";
import { Badge, useLocale } from "@pte/ui";
import type { CheckoutText } from "../hooks/useCheckoutText";
import { BillingPanel } from "./BillingPanel";

interface CheckoutSummaryProps {
  plan: PlanResponse;
  isFree: boolean;
  organizationName?: string;
  /** The organization's student limit now, when known; the limit a capacity plan raises. */
  currentStudentLimit?: number;
  copy: CheckoutText;
}

interface SummaryRow {
  label: string;
  value: ReactNode;
}

const numberLocale = (locale: string): string => (locale === "vi" ? "vi-VN" : "en-US");

const formatAmount = (plan: PlanResponse, locale: string): string =>
  `${Number(plan.price).toLocaleString(numberLocale(locale))} ${plan.currency}`;

/** What the plan is and what it changes for the organization, one fact per line. */
function summaryRows(
  plan: PlanResponse,
  copy: CheckoutText,
  organizationName: string | undefined,
  currentStudentLimit: number | undefined,
  locale: string,
): SummaryRow[] {
  const { text, format } = copy;
  const count = (value: number): string => value.toLocaleString(numberLocale(locale));
  const isExamPackage = plan.type === "EXAM_PACKAGE";
  const rows: SummaryRow[] = [
    {
      label: text.KIND,
      value: isExamPackage ? text.KIND_EXAM : text.KIND_PERMANENT,
    },
  ];
  if (organizationName) rows.push({ label: text.ORGANIZATION, value: organizationName });
  if (isExamPackage) {
    if (plan.maxStudentsPerSession) {
      rows.push({
        label: text.STUDENTS_PER_EXAM,
        value: format("UP_TO", { count: count(plan.maxStudentsPerSession) }),
      });
    }
    rows.push({
      label: text.VALIDITY,
      value: plan.durationDays ? format("VALID_DAYS", { days: plan.durationDays }) : text.VALID_PERMANENT,
    });
  } else if (plan.extraStudentSlots) {
    rows.push({
      label: text.STUDENT_LIMIT,
      // The part that is added is set apart in green, as the free badge below is.
      value:
        currentStudentLimit === undefined ? (
          <span className="text-emerald-600">{format("STUDENT_LIMIT_ADD", { extra: count(plan.extraStudentSlots) })}</span>
        ) : (
          <>
            {format("STUDENT_LIMIT_CHANGE", {
              current: count(currentStudentLimit),
              after: count(currentStudentLimit + plan.extraStudentSlots),
            })}{" "}
            <span className="text-emerald-600">{format("STUDENT_LIMIT_EXTRA", { extra: count(plan.extraStudentSlots) })}</span>
          </>
        ),
    });
  }
  return rows;
}

/** The order: the plan with its price, what it changes, and the total at the bottom, which is what to read last. */
export const CheckoutSummary = ({
  plan,
  isFree,
  organizationName,
  currentStudentLimit,
  copy,
}: CheckoutSummaryProps): ReactElement => {
  const { locale } = useLocale();
  const { text } = copy;
  const amount = formatAmount(plan, locale);
  const rows = summaryRows(plan, copy, organizationName, currentStudentLimit, locale);

  return (
    <BillingPanel title={text.ORDER_SUMMARY} subtitle={text.SELECTED_PACKAGE}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900">{plan.name}</p>
          <p className="mt-1 text-sm text-slate-500">
            {plan.type === "EXAM_PACKAGE" ? text.DESC_EXAM : text.DESC_CAPACITY}
          </p>
        </div>
        <p className="shrink-0 text-sm font-medium text-slate-900">{amount}</p>
      </div>
      <dl className="flex flex-col gap-3 border-b border-slate-100 py-5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="text-right font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between gap-3 pt-5">
        <span className="text-sm font-semibold text-slate-900">{text.TOTAL_DUE}</span>
        <span className="flex items-center gap-3">
          {isFree && <Badge variant="success">{text.FREE_BADGE}</Badge>}
          <span className="text-xl font-bold text-slate-950">{amount}</span>
        </span>
      </div>
    </BillingPanel>
  );
};
