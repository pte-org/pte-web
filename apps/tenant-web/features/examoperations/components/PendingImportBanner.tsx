"use client";

import type { ReactElement } from "react";
import { Alert, Button } from "@pte/ui";
import { ROSTER_TEXT } from "./constants";
import { errorMessage } from "../errorMessage";
import { downloadCredentials } from "../downloadCredentials";
import type { CreatedAccount } from "../types";

interface PendingImportBannerProps {
  accounts: CreatedAccount[];
  onRetryEnroll: () => void;
  onDismiss: () => void;
  isEnrolling?: boolean;
  enrollError?: unknown;
}

const T = ROSTER_TEXT;

export const PendingImportBanner = ({
  accounts,
  onRetryEnroll,
  onDismiss,
  isEnrolling = false,
  enrollError,
}: PendingImportBannerProps): ReactElement => (
  <Alert tone="warning" title={T.RECOVERY_TITLE}>
    <div className="flex flex-col gap-3">
      <p>{T.RECOVERY_TEXT}</p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => downloadCredentials(accounts)}>
          {T.REDOWNLOAD}
        </Button>
        <Button type="button" onClick={onRetryEnroll} isLoading={isEnrolling} loadingText={T.ENROLLING}>
          {T.RETRY_ENROLL}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm font-medium text-gray-500 underline hover:text-gray-700"
        >
          {T.DISMISS}
        </button>
      </div>
      {!!enrollError && <Alert tone="error">{errorMessage(enrollError)}</Alert>}
    </div>
  </Alert>
);
