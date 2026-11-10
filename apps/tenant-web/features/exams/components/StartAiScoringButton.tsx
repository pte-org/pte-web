"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, ConfirmDialog } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useRescoreSession } from "../api/rescore";
import { START_AI_SCORING_TEXT as T } from "../constants";

interface StartAiScoringButtonProps {
  sessionPublicId: string;
}

/** First-time scoring trigger: ingests submitted answers and queues AI scoring (ADR-002, host-gated). */
export const StartAiScoringButton = ({
  sessionPublicId,
}: StartAiScoringButtonProps): ReactElement => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const scoring = useRescoreSession(sessionPublicId);

  const confirm = (): void => {
    setConfirmOpen(false);
    scoring.mutate();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {scoring.isSuccess && <Alert tone="success">{T.QUEUED}</Alert>}
      {scoring.isError && <Alert tone="error">{errorMessage(scoring.error)}</Alert>}
      <div>
        <Button type="button" onClick={() => setConfirmOpen(true)} disabled={scoring.isPending}>
          {scoring.isPending ? T.SUBMITTING : T.BUTTON}
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={T.CONFIRM_TITLE}
        description={T.CONFIRM_DESCRIPTION}
        confirmLabel={T.CONFIRM_LABEL}
        cancelLabel={T.CANCEL_LABEL}
        onConfirm={confirm}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};
