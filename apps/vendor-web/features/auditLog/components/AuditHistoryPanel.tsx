"use client";

import { useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Alert, DataTable, useLocale } from "@pte/ui";
import { usePlatformAuditLogs } from "../api";
import { AUDIT_HISTORY_PAGE_SIZE, PLATFORM_AUDIT_LOG_COPY } from "../constants";
import { AuditEntryDrawer } from "./AuditEntryDrawer";
import { platformAuditColumns } from "./_platformAuditColumns";

interface AuditHistoryPanelProps {
  /** The audit aggregate type, e.g. "Question" or "SCORE_TEMPLATE". */
  aggregateType: string;
  aggregateId: string;
}

/** The audit trail of one catalogue item, newest first, with the before/after view of each edit. */
export const AuditHistoryPanel = ({
  aggregateType,
  aggregateId,
}: AuditHistoryPanelProps): ReactElement => {
  const { locale } = useLocale();
  const T = PLATFORM_AUDIT_LOG_COPY[locale];
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const logs = usePlatformAuditLogs(aggregateType, 0, AUDIT_HISTORY_PAGE_SIZE, "", "", "", {
    aggregateId,
  });

  return (
    <div className="flex flex-col gap-3">
      {logs.error && (
        <Alert tone="error">{getUserFacingApiErrorMessage(logs.error, T.LOAD_FAILED)}</Alert>
      )}
      <DataTable
        columns={platformAuditColumns({ locale, onViewChanges: setOpenEntryId })}
        rows={logs.data?.data ?? []}
        getRowKey={(entry) => entry.log.publicId}
        isLoading={logs.isLoading}
        emptyTitle={T.HISTORY_EMPTY}
      />
      <AuditEntryDrawer publicId={openEntryId} onClose={() => setOpenEntryId(null)} />
    </div>
  );
};
