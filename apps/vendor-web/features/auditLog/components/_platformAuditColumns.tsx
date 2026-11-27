import type { ReactElement } from "react";
import { Button, type DataTableColumn } from "@pte/ui";
import type { PlatformAuditLogEntry } from "../api";
import {
  PLATFORM_AUDIT_ACTION_LABELS,
  PLATFORM_AUDIT_LOG_COPY,
  PLATFORM_AUDIT_RESOURCE_TYPES,
  humanizePlatformAuditCode,
} from "../constants";

type Locale = keyof typeof PLATFORM_AUDIT_LOG_COPY;

interface PlatformAuditColumnOptions {
  locale: Locale;
  /** Opens the before/after view of an entry; only rows with a snapshot get the button. */
  onViewChanges: (publicId: string) => void;
}

const actionLabel = (value: string, locale: Locale): string =>
  PLATFORM_AUDIT_ACTION_LABELS[value]?.[locale] ?? humanizePlatformAuditCode(value);

export const resourceLabel = (value: string, locale: Locale): string =>
  PLATFORM_AUDIT_RESOURCE_TYPES.find((item) => item.value === value)?.label[locale] ??
  humanizePlatformAuditCode(value);

const ResourceCell = ({
  entry,
  locale,
}: {
  entry: PlatformAuditLogEntry;
  locale: Locale;
}): ReactElement => {
  const typeLabel = resourceLabel(entry.log.aggregateType, locale);
  return (
    <div className="min-w-36">
      <p className="font-medium">{entry.log.resourceName?.trim() || typeLabel}</p>
      {entry.log.resourceCode && (
        <p className="mt-1 text-xs text-[var(--table-muted-text)]">
          {typeLabel} · {entry.log.resourceCode}
        </p>
      )}
    </div>
  );
};

/** Columns of the system log table, shared by the full log and the per-item history. */
export function platformAuditColumns({
  locale,
  onViewChanges,
}: PlatformAuditColumnOptions): DataTableColumn<PlatformAuditLogEntry>[] {
  const T = PLATFORM_AUDIT_LOG_COPY[locale];
  const dateFormat = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "short",
    timeStyle: "medium",
  });
  return [
    {
      key: "when",
      header: T.WHEN,
      cell: (entry) => dateFormat.format(new Date(entry.log.createdAt)),
    },
    { key: "action", header: T.ACTION, cell: (entry) => actionLabel(entry.log.action, locale) },
    {
      key: "resource",
      header: T.RESOURCE,
      cell: (entry) => <ResourceCell entry={entry} locale={locale} />,
    },
    { key: "actor", header: T.ACTOR, cell: (entry) => entry.actorName ?? T.UNKNOWN_ACTOR },
    { key: "summary", header: T.SUMMARY, cell: (entry) => entry.log.summary },
    {
      key: "changes",
      header: "",
      sortable: false,
      cell: (entry) =>
        entry.log.hasStateChange ? (
          <Button variant="ghost" size="sm" onClick={() => onViewChanges(entry.log.publicId)}>
            {T.VIEW_CHANGES}
          </Button>
        ) : null,
    },
  ];
}
