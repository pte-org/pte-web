import type { ReactElement } from "react";
import { Chip, StatusBadge } from "@pte/ui";
import type { AttendanceHistoryItemResponse } from "@pte/api-client";
import {
  getAttendanceBadgeVariant,
  getAttendanceStatusLabel,
  PROCTOR_HISTORY_MODAL_TEXT as T,
} from "../constants";
import { incidentRoleLabel } from "../incidentPresentation";

interface AttendanceHistoryEntryProps {
  entry: AttendanceHistoryItemResponse;
}

export function AttendanceHistoryEntry({ entry }: AttendanceHistoryEntryProps): ReactElement {
  const timestamp = new Date(entry.serverActionAt);
  return (
    <li className="grid gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5">
      <div className="space-y-1">
        <time
          dateTime={entry.serverActionAt}
          className="block text-sm font-semibold text-[var(--ink-primary)]"
        >
          {timestamp.toLocaleTimeString("vi-VN")}
        </time>
        <p className="text-xs text-[var(--ink-muted)]">{timestamp.toLocaleDateString("vi-VN")}</p>
        <div className="pt-2">
          <p className="break-words text-sm font-medium text-[var(--ink-primary)]">
            {entry.actorDisplayName || incidentRoleLabel(entry.actorRole)}
          </p>
          <Chip tone="neutral" size="sm" className="mt-1 max-w-full whitespace-normal">
            {incidentRoleLabel(entry.actorRole)}
          </Chip>
        </div>
      </div>
      <div className="min-w-0 space-y-3 sm:border-l sm:border-[var(--border-subtle)] sm:pl-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={getAttendanceStatusLabel(entry.previousStatus)}
            variant={getAttendanceBadgeVariant(entry.previousStatus)}
          />
          <span aria-hidden="true" className="text-[var(--ink-muted)]">
            →
          </span>
          <StatusBadge
            label={getAttendanceStatusLabel(entry.newStatus)}
            variant={getAttendanceBadgeVariant(entry.newStatus)}
          />
        </div>
        <div className="space-y-1 rounded-lg bg-[var(--surface-subtle)] p-3">
          <p className="text-xs font-medium text-[var(--ink-muted)]">{T.COL_REASON}</p>
          <p className="whitespace-pre-wrap break-words text-sm text-[var(--ink-secondary)]">
            {entry.reasonOrNote || T.NO_NOTE}
          </p>
        </div>
      </div>
    </li>
  );
}
