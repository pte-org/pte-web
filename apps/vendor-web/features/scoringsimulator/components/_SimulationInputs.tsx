"use client";

import type { ReactElement } from "react";
import { Checkbox, Select } from "@pte/ui";
import type { TaskTypeRubricResponse } from "@pte/api-client";
import { SIMULATOR_CONFIG } from "../constants";
import type { SimulatorState, SimulatorText } from "../types";

interface SimulationInputsProps {
  rubric: TaskTypeRubricResponse;
  state: SimulatorState;
  text: SimulatorText;
  onChange: (state: SimulatorState) => void;
}

export const SimulationInputs = ({ rubric, state, text: T, onChange }: SimulationInputsProps): ReactElement => (
  <div className="space-y-4">
    {rubric.traits.filter((trait) => trait.key !== SIMULATOR_CONFIG.formKey).map((trait) => {
      const max = trait.perWord ? state.wordCount : trait.maxScore ?? 0;
      const value = state.traitScores[trait.key] ?? 0;
      return <Select key={trait.key} label={trait.displayNameVi} value={String(value)}
        title={trait.levels.find((level) => level.level === value)?.text}
        options={Array.from({ length: max + 1 }, (_, level) => ({ value: String(level),
          label: `${level} — ${trait.levels.find((entry) => entry.level === level)?.text ?? trait.key}` }))}
        onChange={(event) => onChange({ ...state, traitScores: { ...state.traitScores, [trait.key]: Number(event.target.value) } })} />;
    })}
    {rubric.traits.some((trait) => trait.perWord) && <label className="block">
      {T.passage}: {state.wordCount}
      <input type="range" min={1} max={SIMULATOR_CONFIG.maxPassageWords} step={1} value={state.wordCount}
        aria-label={T.passage} className="w-full" onChange={(event) => onChange({ ...state,
          wordCount: Number(event.target.value), traitScores: { ...state.traitScores, CONTENT: 0 } })} />
    </label>}
    {rubric.formBands && <div className="space-y-3">
      <label className="block">{T.words}: {state.textMetrics.wordCount}
        <input type="range" min={0} max={SIMULATOR_CONFIG.maxWordCount} step={1} className="w-full"
          aria-label={T.words} value={state.textMetrics.wordCount}
          onChange={(event) => onChange({ ...state, textMetrics: { ...state.textMetrics, wordCount: Number(event.target.value) } })} />
      </label>
      <Select label={T.sentences} value={String(state.textMetrics.sentenceCount)}
        options={[0, 1, 2, 3].map((value) => ({ label: String(value), value: String(value) }))}
        onChange={(event) => onChange({ ...state, textMetrics: { ...state.textMetrics, sentenceCount: Number(event.target.value) } })} />
      <Checkbox label={T.caps} checked={state.textMetrics.allCaps} onChange={(event) => onChange({ ...state,
        textMetrics: { ...state.textMetrics, allCaps: event.target.checked } })} />
      <Checkbox label={T.punctuation} checked={state.textMetrics.punctuationPresent} onChange={(event) => onChange({ ...state,
        textMetrics: { ...state.textMetrics, punctuationPresent: event.target.checked } })} />
      <Checkbox label={T.bullets} checked={state.textMetrics.bulletOnly} onChange={(event) => onChange({ ...state,
        textMetrics: { ...state.textMetrics, bulletOnly: event.target.checked } })} />
    </div>}
  </div>
);
