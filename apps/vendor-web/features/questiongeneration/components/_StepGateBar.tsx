import type { ReactElement, ReactNode } from "react";
import { Button, Checkbox } from "@pte/ui";
import { GATE_STEP_NAMES } from "../gateConstants";
import type { LiveText } from "../liveConstants";
import { GATE_STEPS } from "../utils/stepGate";

interface StepGateBarProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  /** The screen waits after this step (a rank of GATE_STEPS); null while it is still playing. */
  heldRank: number | null;
  onContinue: () => void;
  locale: "vi" | "en";
  text: LiveText;
  /** Other replay controls shown beside the switch (the typing pace). */
  extra?: ReactNode;
}

/** The switch that stops the replay after each step, and the button that moves it on. */
export const StepGateBar = ({
  enabled,
  onToggle,
  heldRank,
  onContinue,
  locale,
  text,
  extra,
}: StepGateBarProps): ReactElement => {
  const step = heldRank === null ? null : GATE_STEPS[heldRank];
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-4">
        <Checkbox
          id="generation-pause-each-step"
          label={text.pauseEachStep}
          checked={enabled}
          onChange={(event) => onToggle(event.target.checked)}
        />
        {extra}
      </div>
      {step && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--ink-secondary)]">
            {text.stepDone.replace("{step}", GATE_STEP_NAMES[locale][step])}
          </span>
          <Button size="sm" onClick={onContinue}>
            {text.continueStep}
          </Button>
        </div>
      )}
    </div>
  );
};
