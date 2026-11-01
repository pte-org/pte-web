"use client";

import type { ReactElement } from "react";
import { Badge, useLocale, type BadgeVariant } from "@pte/ui";
import {
  useReportPublicationState,
  type ReportPublicationPhase,
} from "../hooks/useReportPublicationState";

export const REPORT_PUBLICATION_ANCHOR_ID = "report-publication";

interface ReportPublicationStatusChipProps {
  sessionPublicId: string;
  sessionStatus: string;
}

const VARIANT: Record<ReportPublicationPhase, BadgeVariant> = {
  notClosed: "neutral",
  published: "success",
  checking: "neutral",
  blocked: "warning",
  ready: "success",
  error: "danger",
};

export const ReportPublicationStatusChip = ({
  sessionPublicId,
  sessionStatus,
}: ReportPublicationStatusChipProps): ReactElement => {
  const { t } = useLocale();
  const { phase, preflight } = useReportPublicationState(sessionPublicId, sessionStatus);
  const blockerCount = preflight.data?.blockerCount ?? 0;
  const label: Record<ReportPublicationPhase, string> = {
    notClosed: t(
      "tenant.publication.chip.notClosed",
      "Cannot publish yet: close the session first",
    ),
    published: t("tenant.publication.chip.published", "Reports published"),
    checking: t("tenant.publication.chip.checking", "Checking publication readiness…"),
    blocked: t(
      "tenant.publication.chip.blocked",
      `Cannot publish yet: ${blockerCount} answer(s) not ready`,
      { count: blockerCount },
    ),
    ready: t("tenant.publication.chip.ready", "Ready to publish"),
    error: t("tenant.publication.chip.error", "Could not check publication readiness"),
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant={VARIANT[phase]}>{label[phase]}</Badge>
      <a
        href={`#${REPORT_PUBLICATION_ANCHOR_ID}`}
        className="text-sm font-medium text-[var(--action)] hover:underline"
      >
        {t("tenant.publication.chip.goTo", "Go to publication")}
      </a>
    </div>
  );
};
