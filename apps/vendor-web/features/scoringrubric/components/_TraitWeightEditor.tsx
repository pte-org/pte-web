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
  return <section className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
    <h2 className="border-b border-[var(--shell-border)] px-5 py-3 text-sm font-semibold">{T.weight}</h2>
    <ul className="divide-y divide-[var(--shell-border)]">{rubric.traits.map((trait) => {
      const gated = rubric.gates.some((gate) => gate.traitKey === trait.key);
      const name = locale === "vi" ? trait.displayNameVi : trait.displayNameEn;
      return <li key={trait.key} className="space-y-2 px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-[var(--ink-muted)]">{T.defaultWeight}: {trait.defaultWeight ?? "—"}{trait.perWord ? ` · ${T.perWord}` : ""}</p>
          </div>
          <Select size="sm" className="w-24 shrink-0" aria-label={`${name} · ${T.weight}`}
            value={String(value.traitWeights[trait.key])} disabled={disabled}
            options={Array.from({ length: RUBRIC_EDIT_CONFIG.maxWeight + 1 }, (_, weight) => ({ value: String(weight), label: String(weight),
              disabled: weight === 0 && gated }))}
            onChange={(event) => onChange({ ...value, traitWeights: { ...value.traitWeights, [trait.key]: Number(event.target.value) } })} />
        </div>
        {gated && <Checkbox label={T.gate} helperText={value.gateEnabled[trait.key] ? undefined : T.gateWarning}
          checked={value.gateEnabled[trait.key]} disabled={disabled}
          onChange={(event) => onChange({ ...value, gateEnabled: { ...value.gateEnabled, [trait.key]: event.target.checked } })} />}
      </li>;
    })}</ul>
  </section>;
};
