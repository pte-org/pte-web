"use client";

import type { ReactElement } from "react";
import { Button, CollapsibleSection, ErrorState, LoadingState } from "@pte/ui";
import { useIncidentHistory } from "../api";
import { getIncidentStatusBadge, PROCTOR_INCIDENT_DETAIL_TEXT } from "../constants";
import { INCIDENT_POPUP_TEXT as T, incidentRoleLabel } from "../incidentPresentation";

interface IncidentHistorySectionProps {
  sessionPublicId: string;
  incidentPublicId: string;
}

export function IncidentHistorySection({
  sessionPublicId,
  incidentPublicId,
}: IncidentHistorySectionProps): ReactElement {
  const query = useIncidentHistory(sessionPublicId, incidentPublicId);
  return (
    <CollapsibleSection title={T.HISTORY} defaultExpanded={false}>
      {query.isLoading ? (
        <LoadingState variant="rows" />
      ) : query.isError ? (
        <ErrorState
          title={T.HISTORY_ERROR}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              {PROCTOR_INCIDENT_DETAIL_TEXT.RETRY_BTN}
            </Button>
          }
        />
      ) : query.data?.length ? (
        <ol className="space-y-4 border-l border-[var(--border-subtle)] pl-4">
          {query.data.map((item) => (
            <li key={item.id} className="space-y-1 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">
                  {item.actorName && !/^[0-9a-f-]{36}$/i.test(item.actorName)
                    ? item.actorName
                    : incidentRoleLabel(item.actorRole)}
                </span>
                <time className="text-xs text-[var(--ink-muted)]">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </time>
              </div>
              <p className="text-xs text-[var(--ink-secondary)]">
                {item.fromStatus ? `${getIncidentStatusBadge(item.fromStatus).label} → ` : ""}
                {getIncidentStatusBadge(item.toStatus).label}
              </p>
              {item.notes && (
                <p className="whitespace-pre-wrap break-words text-[var(--ink-secondary)]">
                  {item.notes}
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[var(--ink-muted)]">
          {PROCTOR_INCIDENT_DETAIL_TEXT.TIMELINE_EMPTY}
        </p>
      )}
    </CollapsibleSection>
  );
}
