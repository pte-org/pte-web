"use client";
import type { ReactElement, ReactNode } from "react";
import { Badge, Button, Checkbox, Select, useLocale } from "@pte/ui";
import type { RubricTaskParameters, TaskTypeRubricResponse } from "@pte/api-client";
import { RUBRIC_EDIT_CONFIG } from "../versionConstants";
import { matchesPearson, resetToPearson, weightShare, weightTotal } from "../traitWeights";
import type { RubricEditText } from "../versionTypes";

interface TraitWeightEditorProps {
  rubric: TaskTypeRubricResponse;
  value: RubricTaskParameters;
  disabled: boolean;
  text: RubricEditText;
  /** The task-type picker, shown in the card's title bar since it decides which task's weights the card lists. */
  taskSelector?: ReactNode;
  onChange: (value: RubricTaskParameters) => void;
}

/**
 * The weights of one task type: a picker in the title bar, each trait with its Pearson reference and share of the
 * total, and a footer that totals the weights and says whether they still match the Pearson reference.
 */
export const TraitWeightEditor = ({ rubric, value, disabled, text: T, taskSelector, onChange }: TraitWeightEditorProps): ReactElement => {
  const { locale } = useLocale();
  const total = weightTotal(value);
  const matches = matchesPearson(rubric, value);
  const percent = (share: number | null): string => (share === null ? "—" : `${share.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}%`);
  return <section className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] shadow-card">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--shell-border)] px-5 py-3">
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{T.weight}</h2>
      {taskSelector}
    </div>
    <ul className="divide-y divide-[var(--shell-border)]">{rubric.traits.map((trait) => {
      const gated = rubric.gates.some((gate) => gate.traitKey === trait.key);
      const name = locale === "vi" ? trait.displayNameVi : trait.displayNameEn;
      return <li key={trait.key} className="space-y-2 px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-[var(--ink-muted)]">
              {T.pearsonShort}: {trait.defaultWeight ?? "—"} · {percent(weightShare(value.traitWeights[trait.key], total))}
              {trait.perWord ? ` · ${T.perWord}` : ""}
            </p>
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--shell-border)] px-5 py-3">
      <span className="text-sm text-[var(--ink-secondary)]">{T.total}: <strong className="font-semibold text-[var(--ink-primary)]">{total}</strong> {T.points}</span>
      {matches
        ? <Badge variant="success">{T.matchesPearson}</Badge>
        : <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => onChange(resetToPearson(rubric, value))}>{T.resetPearson}</Button>}
    </div>
  </section>;
};
