"use client";

import type { ReactElement, ReactNode } from "react";
import { Button } from "./Button";
import { AlertTriangleIcon } from "./icons";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger" | "warning";
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps): ReactElement => (
  <Modal
    open={open}
    title={title}
    titleIcon={
      tone === "warning" ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--cream-tint)] text-[var(--cream-action)]">
          <AlertTriangleIcon className="h-5 w-5" />
        </span>
      ) : undefined
    }
    onClose={onClose}
    isDismissDisabled={isConfirming}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
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
