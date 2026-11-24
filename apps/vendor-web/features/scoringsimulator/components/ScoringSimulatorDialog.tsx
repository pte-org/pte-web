"use client";

import { useState, type ReactElement } from "react";
import { Button, CalculatorIcon, Modal, useLocale } from "@pte/ui";
import { SIMULATOR_TEXT } from "../constants";
import { ScoringSimulatorView } from "./ScoringSimulatorView";

export interface ScoringSimulatorDialogProps {
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  appearance?: "fill" | "outline" | "ghost";
  className?: string;
}

/** A button that opens the scoring simulator in a dialog; the simulator loads only while the dialog is open. */
export const ScoringSimulatorDialog = ({
  fullWidth = false,
  size,
  variant,
  appearance,
  className,
}: ScoringSimulatorDialogProps = {}): ReactElement => {
  const { locale } = useLocale();
  const T = SIMULATOR_TEXT[locale === "vi" ? "vi" : "en"];
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        fullWidth={fullWidth}
        size={size}
        variant={variant}
        appearance={appearance}
        className={className}
        leftIcon={<CalculatorIcon className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      >
        {T.title}
      </Button>
      <Modal open={open} title={T.title} size="wide" closeOnBackdropClick onClose={() => setOpen(false)}>
        <ScoringSimulatorView />
      </Modal>
    </>
  );
};
