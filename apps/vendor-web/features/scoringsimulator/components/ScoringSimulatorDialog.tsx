"use client";

import { useState, type ReactElement } from "react";
import { Button, CalculatorIcon, Modal, useLocale } from "@pte/ui";
import { SIMULATOR_TEXT } from "../constants";
import { ScoringSimulatorView } from "./ScoringSimulatorView";

/** A full-width button that opens the scoring simulator in a dialog; the simulator loads only while the dialog is open. */
export const ScoringSimulatorDialog = (): ReactElement => {
  const { locale } = useLocale();
  const T = SIMULATOR_TEXT[locale === "vi" ? "vi" : "en"];
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" fullWidth leftIcon={<CalculatorIcon className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {T.title}
      </Button>
      <Modal open={open} title={T.title} size="full" closeOnBackdropClick onClose={() => setOpen(false)}>
        <ScoringSimulatorView />
      </Modal>
    </>
  );
};
