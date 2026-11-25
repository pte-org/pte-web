"use client";

import { useState, type ReactElement } from "react";
import { DashboardCard, Tabs, useLocale, type TabItem } from "@pte/ui";
import { AuditHistoryPanel } from "@/features/auditLog/components";
import { useCurrentUser } from "@/features/auth/api";
import { canManagePlatformOperations, canReviewAcademic } from "@/features/auth/permissions";
import {
  QUESTION_AUDIT_AGGREGATE,
  QUESTION_HISTORY_COPY,
  QUESTION_HISTORY_TABS,
} from "../historyConstants";
import { QuestionRevisionCompare } from "./_QuestionRevisionCompare";

interface QuestionHistorySectionProps {
  publicId: string;
}

/**
 * Who changed a question and what changed. Version comparison shows the answer key, so it follows the detail
 * view's rule (reviewers only); the activity log is the platform audit trail, readable by platform operators.
 */
export const QuestionHistorySection = ({
  publicId,
}: QuestionHistorySectionProps): ReactElement | null => {
  const { locale } = useLocale();
  const T = QUESTION_HISTORY_COPY[locale];
  const { data: currentUser } = useCurrentUser();
  const showVersions = canReviewAcademic(currentUser?.roles);
  const showActivity = canManagePlatformOperations(currentUser?.roles);
  const tabs: TabItem[] = [
    ...(showVersions ? [{ id: QUESTION_HISTORY_TABS.VERSIONS, label: T.VERSIONS_TAB }] : []),
    ...(showActivity ? [{ id: QUESTION_HISTORY_TABS.ACTIVITY, label: T.ACTIVITY_TAB }] : []),
  ];
  const [selected, setSelected] = useState<string | null>(null);

  if (tabs.length === 0) return null;
  const active = tabs.some((tab) => tab.id === selected) ? selected : tabs[0].id;

  return (
    <DashboardCard className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{T.TITLE}</h2>
      <Tabs items={tabs} value={active ?? ""} onChange={setSelected} ariaLabel={T.TITLE} />
      {active === QUESTION_HISTORY_TABS.VERSIONS ? (
        <QuestionRevisionCompare publicId={publicId} />
      ) : (
        <AuditHistoryPanel aggregateType={QUESTION_AUDIT_AGGREGATE} aggregateId={publicId} />
      )}
    </DashboardCard>
  );
};
