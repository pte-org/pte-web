"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, ConfirmDialog } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useRescoreSession } from "../api/rescore";
import { useScoringActionText } from "../hooks/useScoringActionText";

interface StartAiScoringButtonProps {
  sessionPublicId: string;
}

/** First-time scoring trigger: ingests submitted answers and queues AI scoring (ADR-002, host-gated). */
export const StartAiScoringButton = ({
  sessionPublicId,
}: StartAiScoringButtonProps): ReactElement => {
  const text = useScoringActionText();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const scoring = useRescoreSession(sessionPublicId);

  const confirm = (): void => {
    setConfirmOpen(false);
    scoring.mutate();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {scoring.isSuccess && <Alert tone="success">{text.startQueued}</Alert>}
      {scoring.isError && <Alert tone="error">{errorMessage(scoring.error)}</Alert>}
      <div>
        <Button type="button" onClick={() => setConfirmOpen(true)} disabled={scoring.isPending}>
          {scoring.isPending ? text.startSubmitting : text.startButton}
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={text.startConfirmTitle}
        description={text.startConfirmDescription}
        confirmLabel={text.startConfirmLabel}
        cancelLabel={text.startCancel}
        onConfirm={confirm}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};
