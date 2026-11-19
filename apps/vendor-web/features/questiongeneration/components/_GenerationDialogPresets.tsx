"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationPreset } from "@pte/api-client";
import { Alert, Button, CollapsibleSection, QuantityStepper } from "@pte/ui";
import { GENERATION_SECTIONS, PRESET_MULTIPLIER_MAX, PRESET_MULTIPLIER_MIN } from "../dialogConstants";
import type { GenerationSelectionState } from "../hooks/useGenerationSelection";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import { isPresetActive } from "../utils/generationSelection";

interface PresetsProps {
  presets: readonly QuestionGenerationPreset[];
  supported: ReadonlySet<string>;
  cap: number;
  state: GenerationSelectionState;
  messages: DialogMessages;
}

/** "Full exam × N" and one button per skill, from the active template; hidden when there is none. */
export const GenerationDialogPresets = ({ presets, supported, cap, state, messages }: PresetsProps): ReactElement | null => {
  if (presets.length === 0) return null;
  const sections = GENERATION_SECTIONS.filter((section) => presets.some((preset) => preset.section === section));
  return (
    <CollapsibleSection title={messages.presetsTitle}>
      <div className="flex flex-wrap items-end gap-3">
        <QuantityStepper
          label={messages.presetMultiplierLabel}
          value={state.multiplier}
          min={PRESET_MULTIPLIER_MIN}
          max={PRESET_MULTIPLIER_MAX}
          onChange={(value) => state.setMultiplier(value, presets, cap)}
        />
        <Button
          type="button"
          variant={isPresetActive(state.selection, presets, "FULL", supported) ? "primary" : "secondary"}
          aria-pressed={isPresetActive(state.selection, presets, "FULL", supported)}
          onClick={() => state.preset("FULL", presets, cap, supported)}
        >
          {messages.presetFull}
        </Button>
        {sections.map((section) => (
          <Button
            key={section}
            type="button"
            variant={isPresetActive(state.selection, presets, section, supported) ? "primary" : "secondary"}
            aria-pressed={isPresetActive(state.selection, presets, section, supported)}
            onClick={() => state.preset(section, presets, cap, supported)}
          >
            {messages[`preset${section}`]}
          </Button>
        ))}
      </div>
      {state.overCapTotal !== null ? (
        <Alert tone="warning" className="mt-3">
          {formatMessage(messages.presetOverCap, { total: state.overCapTotal, cap })}
        </Alert>
      ) : null}
    </CollapsibleSection>
  );
};
