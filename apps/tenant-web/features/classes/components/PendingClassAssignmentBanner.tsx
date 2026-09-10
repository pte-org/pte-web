"use client";

import type { ReactElement } from "react";
import { Alert, Button } from "@pte/ui";
import type { CreatedAccount } from "@/features/examoperations/types";
import { downloadCredentials } from "@/features/examoperations/downloadCredentials";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { PENDING_CLASS_ASSIGNMENT_TEXT } from "../constants";

interface PendingClassAssignmentBannerProps {
  accounts: CreatedAccount[];
  onRetryAssign: () => void;
  onDismiss: () => void;
  isAssigning?: boolean;
  assignError?: unknown;
}

const T = PENDING_CLASS_ASSIGNMENT_TEXT;

/** Mirrors `examoperations`'s `PendingImportBanner.tsx` pattern, with class-assignment wording (see this phase's Design Constraints — not a direct reuse, since that component's text is hardcoded to session/enroll copy). */
export const PendingClassAssignmentBanner = ({
  accounts,
  onRetryAssign,
  onDismiss,
  isAssigning = false,
  assignError,
}: PendingClassAssignmentBannerProps): ReactElement => (
  <Alert tone="warning" title={T.recoveryTitle}>
    <div className="flex flex-col gap-3">
      <p>{T.recoveryText}</p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => downloadCredentials(accounts)}>
          {T.redownload}
        </Button>
        <Button type="button" onClick={onRetryAssign} isLoading={isAssigning} loadingText={T.retryAssign}>
          {T.retryAssign}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm font-medium text-gray-500 underline hover:text-gray-700"
        >
          {T.dismiss}
        </button>
      </div>
      {!!assignError && <Alert tone="error">{errorMessage(assignError)}</Alert>}
    </div>
  </Alert>
);
