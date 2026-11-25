"use client";

import type { ReactElement } from "react";
import { Button, CollapsibleSection, ErrorState, LoadingState } from "@pte/ui";
import { useIncidentHistory } from "../api";
import { useIncidentText } from "../hooks/useIncidentText";

interface IncidentHistorySectionProps {
  sessionPublicId: string;
  incidentPublicId: string;
}

export function IncidentHistorySection({
  sessionPublicId,
  incidentPublicId,
}: IncidentHistorySectionProps): ReactElement {
  const text = useIncidentText();
  const query = useIncidentHistory(sessionPublicId, incidentPublicId);
  return (
    <CollapsibleSection title={text.historyTitle} defaultExpanded>
      {query.isLoading ? (
        <LoadingState variant="rows" />
      ) : query.isError ? (
        <ErrorState
          title={text.historyError}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              {text.retry}
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
                    : text.roleLabel(item.actorRole)}
                </span>
                <time className="text-xs text-[var(--ink-muted)]">
                  {text.formatDateTime(item.createdAt)}
                </time>
              </div>
              <p className="text-xs text-[var(--ink-secondary)]">
                {item.fromStatus ? `${text.statusBadge(item.fromStatus).label} → ` : ""}
                {text.statusBadge(item.toStatus).label}
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
          {text.historyEmpty}
        </p>
      )}
    </CollapsibleSection>
  );
}
