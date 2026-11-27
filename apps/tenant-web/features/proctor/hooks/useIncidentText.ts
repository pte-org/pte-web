"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import type { IncidentCategory, IncidentSeverity, IncidentStatus } from "@pte/api-client";
import { INCIDENT_EN, type IncidentMessageKey, type IncidentMessages } from "../messages/incidentEn";
import { INCIDENT_VI } from "../messages/incidentVi";
import { useAttendanceText } from "./useAttendanceText";

export type IncidentStatusVariant = "danger" | "info" | "success" | "warning" | "neutral";
export type IncidentSeverityVariant = "danger" | "warning" | "neutral";

export interface IncidentText extends IncidentMessages {
  locale: Locale;
  statusBadge: (status?: IncidentStatus) => { label: string; variant: IncidentStatusVariant };
  severityBadge: (severity?: IncidentSeverity) => { label: string; variant: IncidentSeverityVariant };
  categoryLabel: (category: string) => string;
  categoryOptions: ReadonlyArray<{ value: IncidentCategory; label: string }>;
  severityOptions: ReadonlyArray<{ value: IncidentSeverity; label: string }>;
  statusTabs: ReadonlyArray<{ id: IncidentStatus | "ALL"; label: string }>;
  roleLabel: (role: string) => string;
  formatDateTime: (value: string | Date) => string;
}

/** The incident screens' text in the language the user picked; a key missing from the shared dictionary falls back to the catalog. */
export const useIncidentText = (): IncidentText => {
  const { locale, t } = useLocale();
  const attendance = useAttendanceText();
  return useMemo(() => {
    const catalog = locale === "vi" ? INCIDENT_VI : INCIDENT_EN;
    // Both catalogs cover every IncidentMessageKey, so translating each entry keeps the key set complete.
    const m = Object.fromEntries(
      (Object.keys(catalog) as IncidentMessageKey[]).map((key) => [
        key,
        t(`tenant.proctorIncident.${key}`, catalog[key]),
      ]),
    ) as IncidentMessages;

    const statusLabels: Record<IncidentStatus, string> = {
      NEW: m.statusNew,
      IN_PROGRESS: m.statusInProgress,
      ESCALATED: m.statusEscalated,
      RESOLVED: m.statusResolved,
      CLOSED: m.statusClosed,
    };
    const statusVariants: Record<IncidentStatus, IncidentStatusVariant> = {
      NEW: "warning",
      IN_PROGRESS: "info",
      ESCALATED: "danger",
      RESOLVED: "success",
      CLOSED: "neutral",
    };
    const severityLabels: Record<IncidentSeverity, string> = {
      LOW: m.severityLow,
      MEDIUM: m.severityMedium,
      HIGH: m.severityHigh,
    };
    const severityVariants: Record<IncidentSeverity, IncidentSeverityVariant> = {
      LOW: "neutral",
      MEDIUM: "warning",
      HIGH: "danger",
    };
    const categoryOptions: IncidentText["categoryOptions"] = [
      { value: "IDENTITY_VERIFICATION", label: m.categoryIdentityVerification },
      { value: "RULE_VIOLATION", label: m.categoryRuleViolation },
      { value: "TECHNICAL_ISSUE", label: m.categoryTechnicalIssue },
      { value: "DISRUPTION", label: m.categoryDisruption },
      { value: "OTHER", label: m.categoryOther },
    ];
    const dateLocale = locale === "vi" ? "vi-VN" : "en-GB";

    return {
      ...m,
      locale,
      statusBadge: (status = "NEW") => ({
        label: statusLabels[status] ?? statusLabels.CLOSED,
        variant: statusVariants[status] ?? "neutral",
      }),
      severityBadge: (severity = "LOW") => ({
        label: severityLabels[severity] ?? severityLabels.LOW,
        variant: severityVariants[severity] ?? "neutral",
      }),
      categoryLabel: (category) =>
        categoryOptions.find((option) => option.value === category)?.label ?? category,
      categoryOptions,
      severityOptions: [
        { value: "LOW", label: m.severityOptionLow },
        { value: "MEDIUM", label: m.severityOptionMedium },
        { value: "HIGH", label: m.severityOptionHigh },
      ],
      statusTabs: [
        { id: "ALL", label: m.filterAll },
        { id: "NEW", label: m.statusNew },
        { id: "IN_PROGRESS", label: m.statusInProgress },
        { id: "RESOLVED", label: m.statusResolved },
        { id: "CLOSED", label: m.statusClosed },
      ],
      roleLabel: attendance.roleLabel,
      formatDateTime: (value) => (value instanceof Date ? value : new Date(value)).toLocaleString(dateLocale),
    };
  }, [locale, t, attendance.roleLabel]);
};
