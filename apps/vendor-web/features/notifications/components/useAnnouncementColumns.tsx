"use client";

import type { AnnouncementResponse } from "@pte/api-client";
import { Badge, formatShortDateTime, useLocale, type DataTableColumn } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";

/**
 * The announcements table's columns. Status and importance are badges, a draft has no recipients yet (a dash, not a
 * "0/0"), and the time reads the same as on the other admin tables. The title opens the announcement beside the list.
 */
export function useAnnouncementColumns(
  onOpen: (announcement: AnnouncementResponse) => void,
): DataTableColumn<AnnouncementResponse>[] {
  const { locale } = useLocale();
  const T = useAdminCopy({
    TITLE: "Title",
    IMPORTANCE: "Importance",
    STATUS: "Status",
    RECIPIENTS: "Recipients",
    DELIVERED: "delivered",
    UPDATED: "Updated",
    DATE_RANGE: "Date range",
    PUBLISHED: "Published",
    DRAFT: "Draft",
    ALL_STATUSES: "All statuses",
  });
  const categoryLabels = useAdminCopy({
    SYSTEM_NOTICE: "System notice",
    MAINTENANCE: "Maintenance",
    SESSION: "Session",
    APPLICATION: "Application",
    BILLING: "Billing",
  });
  const importanceLabels = useAdminCopy({ INFO: "Informational", IMPORTANT: "Important" });
  const statusFilterOptions = [
    { value: "", label: T.ALL_STATUSES },
    { value: "PUBLISHED", label: T.PUBLISHED },
    { value: "DRAFT", label: T.DRAFT },
  ];

  return [
    {
      key: "title",
      header: T.TITLE,
      cell: (row) => (
        <div>
          <button
            type="button"
            onClick={() => onOpen(row)}
            className="text-left font-medium text-[var(--ink-primary)] hover:text-[var(--action)] hover:underline"
          >
            {row.title}
          </button>
          <p className="mt-1 text-xs text-[var(--table-muted-text)]">
            {categoryLabels[row.category as keyof typeof categoryLabels] ?? row.category}
          </p>
        </div>
      ),
    },
    {
      key: "importance",
      header: T.IMPORTANCE,
      cell: (row) => (
        <Badge variant={row.importance === "IMPORTANT" ? "warning" : "info"}>
          {importanceLabels[row.importance as keyof typeof importanceLabels] ?? row.importance}
        </Badge>
      ),
    },
    {
      key: "status",
      header: T.STATUS,
      filterOptions: statusFilterOptions,
      filterAccessor: (row) => (row.published ? "PUBLISHED" : "DRAFT"),
      cell: (row) => (
        <Badge variant={row.published ? "success" : "warning"}>{row.published ? T.PUBLISHED : T.DRAFT}</Badge>
      ),
    },
    {
      key: "audience",
      header: T.RECIPIENTS,
      cell: (row) =>
        // A draft has not gone anywhere: the server sends it zero counts, which would read as "0/0".
        row.published && row.delivery ? (
          `${row.delivery.deliveredCount}/${row.delivery.audienceCount} ${T.DELIVERED}`
        ) : (
          <span className="text-[var(--table-muted-text)]">—</span>
        ),
    },
    {
      key: "updated",
      header: T.UPDATED,
      filterType: "date-range",
      filterAccessor: (row) => row.updatedAt,
      filterPlaceholder: T.DATE_RANGE,
      cell: (row) => (
        <span className="tabular-nums">{formatShortDateTime(row.updatedAt, locale === "vi" ? "vi" : "en")}</span>
      ),
    },
  ];
}
