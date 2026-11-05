"use client";

import type { ReactElement } from "react";
import { Button, Input, useLocale } from "@pte/ui";
import type { RubricTraitDetailsResponse } from "@pte/api-client";
import { SIMULATOR_CONFIG } from "../constants";
import type { SimulatorText } from "../types";

interface TraitScorePickerProps {
  trait: RubricTraitDetailsResponse;
  maximum: number;
  value?: number;
  text: SimulatorText;
  onChange: (value: number) => void;
}

export const TraitScorePicker = ({ trait, maximum, value, text: T, onChange }: TraitScorePickerProps): ReactElement => {
  const { locale } = useLocale();
  const name = locale === "vi" ? trait.displayNameVi : trait.displayNameEn;
  const description = trait.levels.find((level) => level.level === value)?.text;
  return <fieldset className="min-w-0 space-y-3 border-b border-[var(--divider)] pb-5 last:border-0 last:pb-0">
    <legend className="mb-3 text-sm font-medium text-[var(--ink-primary)]">{name}
      <span className="ml-2 text-xs font-normal text-[var(--ink-secondary)]">{T.maximum}: {Number.isFinite(maximum) ? maximum : T.noValue}</span>
    </legend>
    {trait.perWord || maximum > SIMULATOR_CONFIG.maxButtonBand ? <Input id={`score-${trait.key}`} type="number"
      aria-label={name} min={0} max={Number.isFinite(maximum) ? maximum : undefined} step={1} value={value !== undefined && Number.isFinite(value) ? value : ""}
      placeholder={T.choose}
      error={value !== undefined && (!Number.isInteger(value) || value < 0 || value > maximum)
        ? T.invalidBand.replace("{max}", String(maximum)) : undefined} helperText={trait.perWord ? T.perWordHint : undefined}
      onChange={(event) => onChange(event.target.valueAsNumber)} />
      : <div className="flex flex-wrap gap-2">
        {Array.from({ length: maximum + 1 }, (_, band) => <Button key={band} type="button" size="sm"
          variant={value === band ? "primary" : "secondary"} aria-pressed={value === band}
          aria-label={`${name}: ${band}`} onClick={() => onChange(band)}>{band}</Button>)}
      </div>}
    {description ? <div className="space-y-1 rounded-lg bg-[var(--surface-subtle)] p-3">
      <p className="text-xs text-[var(--ink-muted)]">{T.description}</p>
      <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{description}</p>
    </div> : value === undefined && <p className="text-xs text-[var(--ink-muted)]">{T.choose}</p>}
  </fieldset>;
};
