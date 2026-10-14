"use client";

import type { ReactElement } from "react";
import { Alert, Button } from "@pte/ui";
import type { CreatedAccount } from "@/features/examoperations/types";
import { downloadCredentials } from "@/features/examoperations/downloadCredentials";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useStudentImportText } from "../hooks/useStudentImportText";

interface PendingClassAssignmentBannerProps {
  accounts: CreatedAccount[];
  onRetryAssign: () => void;
  onDismiss: () => void;
  isAssigning?: boolean;
  assignError?: unknown;
}

/** Mirrors `examoperations`'s `PendingImportBanner.tsx` pattern, with class-assignment wording (see this phase's Design Constraints — not a direct reuse, since that component's text is hardcoded to session/enroll copy). */
export const PendingClassAssignmentBanner = ({
  accounts,
  onRetryAssign,
  onDismiss,
  isAssigning = false,
  assignError,
}: PendingClassAssignmentBannerProps): ReactElement => {
  const text = useStudentImportText();

  return (
    <Alert tone="warning" title={text.recoveryTitle}>
      <div className="flex flex-col gap-3">
        <p>{text.recoveryText}</p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => downloadCredentials(accounts)}>
            {text.redownload}
          </Button>
          <Button
            type="button"
            onClick={onRetryAssign}
            isLoading={isAssigning}
            loadingText={text.retryAssign}
          >
            {text.retryAssign}
          </Button>
          <Button type="button" variant="ghost" onClick={onDismiss}>
            {text.dismiss}
          </Button>
        </div>
        {!!assignError && <Alert tone="error">{errorMessage(assignError)}</Alert>}
      </div>
    </Alert>
  );
};
