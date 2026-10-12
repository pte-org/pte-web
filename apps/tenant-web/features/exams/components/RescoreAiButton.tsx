"use client";

import type { ReactElement } from "react";
import { Alert, Button } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useRescoreSession } from "../api/rescore";
import { RESCORE_TEXT as T } from "../constants";

interface RescoreAiButtonProps {
  sessionPublicId: string;
  /** Failed or stuck answers the server would queue again. */
  rescorableCount: number;
  publicationLocked: boolean;
}

/** Re-queues failed and stuck AI answers. Hidden once reports are published or nothing needs it. */
export const RescoreAiButton = ({
  sessionPublicId,
  rescorableCount,
  publicationLocked,
}: RescoreAiButtonProps): ReactElement | null => {
  const rescore = useRescoreSession(sessionPublicId);

  const hasWork = rescorableCount > 0;
  if (publicationLocked || (!hasWork && !rescore.isSuccess)) return null;

  return (
    <div className="flex flex-col gap-2 rounded-md bg-[var(--surface-subtle)] p-4 text-sm">
      {hasWork && <p>{T.DESCRIPTION(rescorableCount)}</p>}
      {rescore.isSuccess && <Alert tone="success">{T.QUEUED}</Alert>}
      {rescore.isError && <Alert tone="error">{errorMessage(rescore.error)}</Alert>}
      {hasWork && (
        <div>
          <Button type="button" onClick={() => rescore.mutate()} disabled={rescore.isPending}>
            {rescore.isPending ? T.SUBMITTING : T.BUTTON(rescorableCount)}
          </Button>
        </div>
      )}
    </div>
  );
};
