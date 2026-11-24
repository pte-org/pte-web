"use client";

import type { ReactElement } from "react";
import { Input } from "@pte/ui";
import type { TaskTypeRubricResponse } from "@pte/api-client";
import { SIMULATOR_CONFIG } from "../constants";
import { selectSimulatorTrait } from "../simulatorState";
import type { SimulatorState, SimulatorText } from "../types";
import { TraitScorePicker } from "./_TraitScorePicker";
import { SimulationWritingInputs } from "./_SimulationWritingInputs";

interface SimulationInputsProps {
  rubric: TaskTypeRubricResponse;
  state: SimulatorState;
  text: SimulatorText;
  onChange: (state: SimulatorState) => void;
}

export const SimulationInputs = ({ rubric, state, text: T, onChange }: SimulationInputsProps): ReactElement => {
  const hasPerWord = rubric.traits.some((trait) => trait.perWord);
  const perWordTrait = rubric.traits.find((trait) => trait.perWord);
  const otherTraits = rubric.traits.filter(
    (trait) => trait.key !== SIMULATOR_CONFIG.formKey && (!hasPerWord || trait.key !== perWordTrait?.key),
  );

  return (
    <div className="space-y-5">
      {hasPerWord && perWordTrait && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-[var(--divider)] p-4 bg-[var(--surface-subtle)] items-start">
          <div className="flex flex-col">
            <div className="mb-1.5 flex h-5 items-baseline text-sm font-semibold text-[var(--ink-primary)]">
              <span>{T.passage}</span>
            </div>
            <Input
              id="passage-word-count"
              type="number"
              min={1}
              max={SIMULATOR_CONFIG.maxPassageWords}
              step={1}
              helperText={T.passageHint}
              placeholder="60"
              error={
                !Number.isInteger(state.wordCount) ||
                state.wordCount < 1 ||
                state.wordCount > SIMULATOR_CONFIG.maxPassageWords
                  ? T.invalidPassage
                  : undefined
              }
              value={Number.isFinite(state.wordCount) ? state.wordCount : ""}
              onChange={(event) =>
                onChange({
                  ...state,
                  wordCount: event.target.valueAsNumber,
                  selectedTraits: state.selectedTraits.filter((key) => key !== perWordTrait.key),
                })
              }
            />
          </div>
          <TraitScorePicker
            trait={perWordTrait}
            maximum={state.wordCount}
            value={state.selectedTraits.includes(perWordTrait.key) ? state.traitScores[perWordTrait.key] : undefined}
            text={T}
            hideBorder
            onChange={(value) => onChange(selectSimulatorTrait(state, perWordTrait.key, value))}
          />
        </div>
      )}
      {otherTraits.map((trait) => (
        <TraitScorePicker
          key={trait.key}
          trait={trait}
          maximum={trait.perWord ? state.wordCount : trait.maxScore ?? 0}
          value={state.selectedTraits.includes(trait.key) ? state.traitScores[trait.key] : undefined}
          text={T}
          onChange={(value) => onChange(selectSimulatorTrait(state, trait.key, value))}
        />
      ))}
      {rubric.formBands && <SimulationWritingInputs state={state} text={T} onChange={onChange} />}
    </div>
  );
};
