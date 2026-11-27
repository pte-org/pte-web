"use client";

import type { ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Alert, Drawer, LoadingState, useLocale } from "@pte/ui";
import { usePlatformAuditEntry } from "../api";
import { PLATFORM_AUDIT_LOG_COPY } from "../constants";
import { AuditChangeDiff } from "./AuditChangeDiff";

interface AuditEntryDrawerProps {
  /** The entry to show; null keeps the drawer closed. */
  publicId: string | null;
  onClose: () => void;
}

export const AuditEntryDrawer = ({ publicId, onClose }: AuditEntryDrawerProps): ReactElement => {
  const { locale } = useLocale();
  const T = PLATFORM_AUDIT_LOG_COPY[locale];
  const entry = usePlatformAuditEntry(publicId);

  return (
    <Drawer
      open={publicId !== null}
      onClose={onClose}
      title={T.CHANGES_TITLE}
      description={entry.data?.entry.summary}
    >
      {entry.isLoading && <LoadingState label={T.CHANGES_LOADING} />}
      {entry.error && (
        <Alert tone="error">{getUserFacingApiErrorMessage(entry.error, T.CHANGES_FAILED)}</Alert>
      )}
      {entry.data && (
        <AuditChangeDiff before={entry.data.beforeState} after={entry.data.afterState} />
      )}
    </Drawer>
  );
};
