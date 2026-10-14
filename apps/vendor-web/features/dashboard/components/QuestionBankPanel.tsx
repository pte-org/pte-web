"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { AdminDashboardResponse, QuestionPool, QuestionStatus } from "@pte/api-client";
import { Badge } from "@pte/ui";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { formatNumber } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

export interface QuestionBankPanelProps {
  section: AdminDashboardResponse["questionBank"];
  onRetry: () => void;
  className?: string;
}

const QUESTION_STATUSES: readonly QuestionStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "ARCHIVED",
];

const QUESTION_POOLS: readonly QuestionPool[] = ["EXAM", "PRACTICE"];

export const QuestionBankPanel = ({
  section,
  onRetry,
  className,
}: QuestionBankPanelProps): ReactElement | null => {
  const { locale, messages, format } = useAdminDashboardText();

  return (
    <SectionPanel
      title={messages.questionBankTitle}
      subtitle={messages.questionBankSubtitle}
      actions={
        <Link
          href={ADMIN_DASHBOARD_ROUTES.questions}
          className="text-xs font-semibold text-action hover:underline"
        >
          {messages.questionBankManage}
        </Link>
      }
      section={section}
      onRetry={onRetry}
      className={className}
    >
      {(data) => (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--shell-border)] pb-3">
            <div>
              <span className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                {messages.questionBankTotal}
              </span>
              <p className="text-2xl font-bold tabular-nums text-[var(--ink-primary)]">
                {formatNumber(data.total, locale)}
              </p>
            </div>
            <p className="text-xs text-[var(--ink-secondary)]">
              {format("questionBankCreatedInWindow", {
                count: formatNumber(data.createdInWindow.current, locale),
                days: 30,
              })}
            </p>
          </div>

          {/* Status Breakdown */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {messages.byStatusTitle}
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUESTION_STATUSES.map((status) => (
                <div
                  key={status}
                  className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-muted)] p-3"
                >
                  <dt className="text-xs text-[var(--ink-secondary)]">
                    {messages[`questionStatus${status}` as keyof typeof messages] ?? status}
                  </dt>
                  <dd className="mt-1 text-base font-bold tabular-nums text-[var(--ink-primary)]">
                    {formatNumber(data.byStatus[status] ?? 0, locale)}
                  </dd>
                </div>
              ))}
            </div>
          </div>

          {/* Approved Pool Stock */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {messages.approvedExamStock}
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {QUESTION_POOLS.map((pool) => {
                const label =
                  pool === "EXAM" ? messages.approvedExamStock : messages.approvedPracticeStock;
                return (
                  <div
                    key={pool}
                    className="flex items-center justify-between rounded-lg border border-[var(--shell-border)] p-3"
                  >
                    <div>
                      <span className="text-sm font-medium text-[var(--ink-primary)]">{label}</span>
                      <div className="mt-1">
                        <Badge variant={pool === "EXAM" ? "info" : "neutral"}>
                          {messages[`questionPool${pool}` as keyof typeof messages] ?? pool}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-lg font-bold tabular-nums text-[var(--ink-primary)]">
                      {formatNumber(data.approvedByPool[pool] ?? 0, locale)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </SectionPanel>
  );
};
