"use client";

import type { ReactElement } from "react";
import { Button, FormActions } from "@pte/ui";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import type { SubmitMode } from "../utils/generationSelection";

interface FooterProps {
  mode: SubmitMode;
  total: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  messages: DialogMessages;
  onCancel: () => void;
  onSubmit: () => void;
}

export const GenerationDialogFooter = ({
  mode,
  total,
  canSubmit,
  isSubmitting,
  messages,
  onCancel,
  onSubmit,
}: FooterProps): ReactElement => (
  <FormActions>
    <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
      {messages.cancel}
    </Button>
    <Button
      type="button"
      onClick={onSubmit}
      disabled={!canSubmit || isSubmitting}
      isLoading={isSubmitting}
    >
      {mode === "single" ? messages.submitSingle : formatMessage(messages.submitBatch, { total })}
    </Button>
  </FormActions>
);
