"use client";

import type { ReactElement, ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Huy",
  tone = "primary",
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps): ReactElement => (
  <Modal
    open={open}
    title={title}
    onClose={onClose}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === "danger" ? "danger" : "primary"}
          isLoading={isConfirming}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div className="text-sm text-gray-600">{description}</div>
  </Modal>
);
