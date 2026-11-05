"use client";
import type { ReactElement } from "react";
import { Checkbox, Select, useLocale } from "@pte/ui";
import type { RubricTaskParameters, TaskTypeRubricResponse } from "@pte/api-client";
import { RUBRIC_EDIT_CONFIG } from "../versionConstants";
import type { RubricEditText } from "../versionTypes";

interface TraitWeightEditorProps {
  rubric: TaskTypeRubricResponse;
  value: RubricTaskParameters;
  disabled: boolean;
  text: RubricEditText;
  onChange: (value: RubricTaskParameters) => void;
}
export const TraitWeightEditor = ({ rubric, value, disabled, text: T, onChange }: TraitWeightEditorProps): ReactElement => {
  const { locale } = useLocale();
  return <div className="space-y-5">{rubric.traits.map((trait) => <div key={trait.key} className="space-y-2">
    <Select label={`${locale === "vi" ? trait.displayNameVi : trait.displayNameEn} · ${T.weight}`}
      value={String(value.traitWeights[trait.key])} disabled={disabled}
      options={Array.from({ length: RUBRIC_EDIT_CONFIG.maxWeight + 1 }, (_, weight) => ({ value: String(weight), label: String(weight),
        disabled: weight === 0 && rubric.gates.some((gate) => gate.traitKey === trait.key) }))}
      onChange={(event) => onChange({ ...value, traitWeights: { ...value.traitWeights, [trait.key]: Number(event.target.value) } })} />
    <p className="text-sm">{T.defaultWeight}: {trait.defaultWeight ?? "—"}</p>
    {trait.perWord && <p className="text-sm">{T.perWord}</p>}
    {rubric.gates.some((gate) => gate.traitKey === trait.key) && <Checkbox label={`${T.gate}: ${trait.key}`}
      helperText={T.gateWarning} checked={value.gateEnabled[trait.key]} disabled={disabled}
      onChange={(event) => onChange({ ...value, gateEnabled: { ...value.gateEnabled, [trait.key]: event.target.checked } })} />}
  </div>)}</div>;
};
