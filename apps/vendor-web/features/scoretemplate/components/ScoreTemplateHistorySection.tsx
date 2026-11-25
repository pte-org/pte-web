"use client";

import type { ReactElement } from "react";
import { DashboardCard, useLocale } from "@pte/ui";
import { AuditHistoryPanel } from "@/features/auditLog/components";
import { useCurrentUser } from "@/features/auth/api";
import { canManagePlatformOperations } from "@/features/auth/permissions";
import { EXAM_TEMPLATE_AUDIT_AGGREGATE, EXAM_TEMPLATE_HISTORY_COPY } from "../historyConstants";

interface ScoreTemplateHistorySectionProps {
  publicId: string;
}

/** Edit trail of one template version with before/after items; shown to platform operators only. */
export const ScoreTemplateHistorySection = ({
  publicId,
}: ScoreTemplateHistorySectionProps): ReactElement | null => {
  const { locale } = useLocale();
  const { data: currentUser } = useCurrentUser();

  if (!canManagePlatformOperations(currentUser?.roles)) return null;

  return (
    <DashboardCard className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">
        {EXAM_TEMPLATE_HISTORY_COPY[locale].TITLE}
      </h2>
      <AuditHistoryPanel aggregateType={EXAM_TEMPLATE_AUDIT_AGGREGATE} aggregateId={publicId} />
    </DashboardCard>
  );
};
