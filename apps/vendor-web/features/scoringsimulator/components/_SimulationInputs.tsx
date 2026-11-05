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

export const SimulationInputs = ({ rubric, state, text: T, onChange }: SimulationInputsProps): ReactElement => (
  <div className="space-y-6">
    {rubric.traits.some((trait) => trait.perWord) && <Input type="number" label={T.passage}
      min={1} max={SIMULATOR_CONFIG.maxPassageWords} step={1} helperText={T.passageHint}
      error={!Number.isInteger(state.wordCount) || state.wordCount < 1 || state.wordCount > SIMULATOR_CONFIG.maxPassageWords ? T.invalidPassage : undefined}
      value={Number.isFinite(state.wordCount) ? state.wordCount : ""} onChange={(event) => onChange({ ...state,
        wordCount: event.target.valueAsNumber,
        selectedTraits: state.selectedTraits.filter((key) => !rubric.traits.some((trait) => trait.key === key && trait.perWord)),
      })} />}
    {rubric.traits.filter((trait) => trait.key !== SIMULATOR_CONFIG.formKey).map((trait) => (
      <TraitScorePicker key={trait.key} trait={trait} maximum={trait.perWord ? state.wordCount : trait.maxScore ?? 0}
        value={state.selectedTraits.includes(trait.key) ? state.traitScores[trait.key] : undefined} text={T}
        onChange={(value) => onChange(selectSimulatorTrait(state, trait.key, value))} />
    ))}
    {rubric.formBands && <SimulationWritingInputs state={state} text={T} onChange={onChange} />}
  </div>
);
