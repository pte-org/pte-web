"use client";

import type { ReactElement } from "react";
import { Checkbox, CollapsibleSection, Input, Select } from "@pte/ui";
import { SIMULATOR_CONFIG } from "../constants";
import type { SimulatorState, SimulatorText } from "../types";

interface SimulationWritingInputsProps { state: SimulatorState; text: SimulatorText; onChange: (state: SimulatorState) => void }

export const SimulationWritingInputs = ({ state, text: T, onChange }: SimulationWritingInputsProps): ReactElement => (
  <CollapsibleSection title={T.context} subtitle={T.formHint} collapsible={false}>
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input type="number" label={T.words} min={0} max={SIMULATOR_CONFIG.maxWordCount} step={1}
          error={!Number.isInteger(state.textMetrics.wordCount) || state.textMetrics.wordCount < 0 ||
            state.textMetrics.wordCount > SIMULATOR_CONFIG.maxWordCount ? T.invalidWords : undefined}
          value={Number.isFinite(state.textMetrics.wordCount) ? state.textMetrics.wordCount : ""}
          onChange={(event) => onChange({ ...state, textMetrics: { ...state.textMetrics, wordCount: event.target.valueAsNumber } })} />
        <Select label={T.sentences} value={String(state.textMetrics.sentenceCount)}
          options={[0, 1, 2, 3].map((value) => ({ label: String(value), value: String(value) }))}
          onChange={(event) => onChange({ ...state, textMetrics: { ...state.textMetrics, sentenceCount: Number(event.target.value) } })} />
      </div>
      <Checkbox label={T.caps} checked={state.textMetrics.allCaps} onChange={(event) => onChange({ ...state,
        textMetrics: { ...state.textMetrics, allCaps: event.target.checked } })} />
      <Checkbox label={T.punctuation} checked={state.textMetrics.punctuationPresent} onChange={(event) => onChange({ ...state,
        textMetrics: { ...state.textMetrics, punctuationPresent: event.target.checked } })} />
      <Checkbox label={T.bullets} checked={state.textMetrics.bulletOnly} onChange={(event) => onChange({ ...state,
        textMetrics: { ...state.textMetrics, bulletOnly: event.target.checked } })} />
    </div>
  </CollapsibleSection>
);
