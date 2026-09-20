"use client";

import type { ReactElement } from "react";
import { Alert, Button, Modal } from "@pte/ui";
import { SCORE_TEMPLATE_TEXT } from "../constants";
import type { ScoreTemplateResponse } from "../types";

interface ActivateTemplateModalProps {
  /** The DRAFT to activate; `null` keeps the modal closed. */
  template: ScoreTemplateResponse | null;
  isActivating: boolean;
  /** A failed confirm attempt's message — shown here, not on the page behind the modal's backdrop, so it's actually visible. */
  errorMessage?: string;
  onCancel: () => void;
  onConfirm: (template: ScoreTemplateResponse) => void;
}

export const ActivateTemplateModal = ({
  template,
  isActivating,
  errorMessage,
  onCancel,
  onConfirm,
}: ActivateTemplateModalProps): ReactElement => (
  <Modal
    open={template !== null}
    onClose={onCancel}
    title={SCORE_TEMPLATE_TEXT.ACTIVATE_MODAL_TITLE}
    footer={
      <>
        <Button variant="ghost" onClick={onCancel} disabled={isActivating}>
          {SCORE_TEMPLATE_TEXT.ACTIVATE_CANCEL}
        </Button>
        <Button
          variant="primary"
          isLoading={isActivating}
          onClick={() => template && onConfirm(template)}
        >
          {SCORE_TEMPLATE_TEXT.ACTIVATE_CONFIRM}
        </Button>
      </>
    }
  >
    <p className="text-sm text-gray-600">{SCORE_TEMPLATE_TEXT.ACTIVATE_MODAL_WARNING}</p>
    {errorMessage && (
      <Alert tone="error" className="mt-4">
        {errorMessage}
      </Alert>
    )}
    {template && (
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <p className="font-semibold text-gray-900">
          {template.code} v{template.version}
        </p>
        <p className="text-sm text-gray-600">{template.name}</p>
      </div>
    )}
  </Modal>
);
