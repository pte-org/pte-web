"use client";
import type { ReactElement, ReactNode } from "react";
import { Badge, formatShortDateTime, useLocale } from "@pte/ui";
import type { RubricVersionResponse } from "@pte/api-client";
import type { RubricEditText } from "../versionTypes";
import { statusLabel, statusVariant } from "../versionStatus";

interface VersionInfoPanelProps { version: RubricVersionResponse; text: RubricEditText }

/** Who made the version and when it last changed: the facts the header does not carry. */
export const VersionInfoPanel = ({ version, text: T }: VersionInfoPanelProps): ReactElement => {
  const { locale } = useLocale();
  const when = (iso?: string | null): string => (iso ? formatShortDateTime(iso, locale === "vi" ? "vi" : "en") : "—");
  const rows: { label: string; value: ReactNode }[] = [
    { label: T.status, value: <Badge variant={statusVariant(version.status)}>{statusLabel(version.status, T)}</Badge> },
    { label: T.author, value: version.authorName ?? "—" },
    { label: T.createdAt, value: when(version.createdAt) },
    { label: T.updatedAt, value: when(version.updatedAt) },
    ...(version.updatedByName ? [{ label: T.updatedBy, value: version.updatedByName }] : []),
  ];
  return (
    <section className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card">
      <h2 className="mb-4 border-b border-[var(--shell-border)] pb-3 text-base font-semibold text-[var(--ink-primary)]">{T.versionInfo}</h2>
      <dl className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="shrink-0 text-[var(--ink-secondary)]">{row.label}</dt>
            <dd className="min-w-0 break-words text-right font-medium text-[var(--ink-primary)]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
