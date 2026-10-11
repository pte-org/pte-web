"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { Badge, DataTable, useLocale, type DataTableColumn } from "@pte/ui";
import {
  EXAM_TABLE_HEADERS,
  EXAM_MODE_LABELS,
  EXAM_SKILL_OPTIONS,
  EXAMS_TEXT,
  SESSION_DETAIL_TEXT,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_VARIANT,
} from "../constants";
import type { ExamSession } from "../types";

interface SessionTableProps {
  sessions: ExamSession[];
  isLoading?: boolean;
  toolbarActions?: ReactNode;
}

function formatDateTime(value: string, locale: "vi" | "en"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const SessionTable = ({
  sessions,
  isLoading,
  toolbarActions,
}: SessionTableProps): ReactElement => {
  const { locale, t } = useLocale();
  const statusLabel = (status: string): string =>
    t(
      `tenant.examStatus.${status.toLowerCase()}`,
      SESSION_STATUS_LABELS[status as keyof typeof SESSION_STATUS_LABELS] ?? status,
    );
  const modeLabel = (session: ExamSession): string =>
    session.examMode
      ? t(
          "tenant.createExam.MODE_REAL",
          EXAM_MODE_LABELS[session.examMode],
        )
      : t("tenant.examDetails.legacyMode", SESSION_DETAIL_TEXT.LEGACY_MODE);
  const skillLabel = (skill: string): string => {
    const fallback = EXAM_SKILL_OPTIONS.find((option) => option.value === skill)?.label ?? skill;
    return t(`tenant.createExam.skill.${skill}`, fallback);
  };
  const retrySummary = (retries: number): string =>
    t("tenant.examDetails.retrySummary", SESSION_DETAIL_TEXT.RETRIES_SUMMARY(retries), {
      retries,
      retriesLabel: retries === 1 ? "retry" : "retries",
    });
  const statusFilterOptions = [
    { value: "", label: t("tenant.examList.allStatuses", "All statuses") },
    ...Object.keys(SESSION_STATUS_LABELS).map((key) => ({
      value: key,
      label: statusLabel(key),
    })),
  ];
  const columns: DataTableColumn<ExamSession>[] = [
    {
      key: "name",
      header: t("tenant.examList.name", EXAM_TABLE_HEADERS.NAME),
      cell: (session) => (
        <Link
          href={`/host/exams/${session.id}`}
          className="font-medium text-blue-700 hover:underline"
        >
          {session.name}
        </Link>
      ),
    },
    {
      key: "sessionCode",
      header: t("tenant.examList.code", EXAM_TABLE_HEADERS.CODE),
      className: "whitespace-nowrap",
      cell: (session) => (
        <code className="whitespace-nowrap text-xs text-gray-700">{session.sessionCode}</code>
      ),
    },
    {
      key: "configuration",
      header: t("tenant.examList.configuration", EXAM_TABLE_HEADERS.CONFIGURATION),
      cell: (session) => (
        <div className="text-sm">
          <div className="font-medium text-gray-800">{modeLabel(session)}</div>
          <div className="text-gray-500">
            {session.selectedSkills.length > 0
              ? session.selectedSkills.map((skill) => skillLabel(skill)).join(", ")
              : t("tenant.examDetails.legacySkills", SESSION_DETAIL_TEXT.LEGACY_SKILLS)}
            {" · "}
            {retrySummary(session.maxRetriesPerStudent)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: t("tenant.examList.status", EXAM_TABLE_HEADERS.STATUS),
      filterOptions: statusFilterOptions,
      filterAccessor: (session) => session.status,
      cell: (session) => (
        <Badge variant={SESSION_STATUS_VARIANT[session.status]}>
          {statusLabel(session.status)}
        </Badge>
      ),
    },
    {
      key: "opensAt",
      header: t("tenant.examList.opens", EXAM_TABLE_HEADERS.OPENS_AT),
      filterType: "date-range",
      filterAccessor: (session) => session.opensAt,
      filterPlaceholder: t("tenant.examList.dateRange", "Date range"),
      cell: (session) => formatDateTime(session.opensAt, locale),
    },
    {
      key: "closesAt",
      header: t("tenant.examList.closes", EXAM_TABLE_HEADERS.CLOSES_AT),
      filterType: "date-range",
      filterAccessor: (session) => session.closesAt,
      filterPlaceholder: t("tenant.examList.dateRange", "Date range"),
      cell: (session) => formatDateTime(session.closesAt, locale),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={sessions}
      getRowKey={(session) => session.id}
      isLoading={isLoading}
      emptyTitle={t("tenant.examList.emptyTitle", EXAMS_TEXT.EMPTY_TITLE)}
      emptyDescription={t("tenant.examList.emptyDescription", EXAMS_TEXT.EMPTY_TEXT)}
      toolbarActions={toolbarActions}
    />
  );
};
