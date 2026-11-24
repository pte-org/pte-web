"use client";

import type { ReactElement } from "react";
import { Button, Input, useLocale } from "@pte/ui";
import type { RubricTraitDetailsResponse } from "@pte/api-client";
import { SIMULATOR_CONFIG } from "../constants";
import type { SimulatorText } from "../types";

export interface TraitScorePickerProps {
  trait: RubricTraitDetailsResponse;
  maximum: number;
  value?: number;
  text: SimulatorText;
  hideBorder?: boolean;
  onChange: (value: number) => void;
}

export const TraitScorePicker = ({
  trait,
  maximum,
  value,
  text: T,
  hideBorder = false,
  onChange,
}: TraitScorePickerProps): ReactElement => {
  const { locale } = useLocale();
  const name = locale === "vi" ? trait.displayNameVi : trait.displayNameEn;
  const description = trait.levels.find((level) => level.level === value)?.text;
  const isPerWordOrLarge = trait.perWord || maximum > SIMULATOR_CONFIG.maxButtonBand;

  return (
    <fieldset
      className={`min-w-0 space-y-2 ${
        hideBorder ? "" : "border-b border-[var(--divider)] pb-5 last:border-0 last:pb-0"
      }`}
    >
      <legend className="mb-1.5 flex h-5 w-full items-baseline justify-between text-sm font-semibold text-[var(--ink-primary)]">
        <span>{name}</span>
        <span className="text-xs font-normal text-[var(--ink-secondary)]">
          {T.maximum}: {Number.isFinite(maximum) ? maximum : T.noValue}
        </span>
      </legend>
      {isPerWordOrLarge ? (
        <Input
          id={`score-${trait.key}`}
          type="number"
          aria-label={name}
          min={0}
          max={Number.isFinite(maximum) ? maximum : undefined}
          step={1}
          value={value !== undefined && Number.isFinite(value) ? value : ""}
          placeholder={Number.isFinite(maximum) ? `0 – ${maximum}` : T.choose}
          error={
            value !== undefined && (!Number.isInteger(value) || value < 0 || value > maximum)
              ? T.invalidBand.replace("{max}", String(maximum))
              : undefined
          }
          helperText={trait.perWord ? T.perWordHint : undefined}
          onChange={(event) => onChange(event.target.valueAsNumber)}
        />
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {Array.from({ length: maximum + 1 }, (_, band) => (
            <Button
              key={band}
              type="button"
              size="sm"
              variant={value === band ? "primary" : "secondary"}
              aria-pressed={value === band}
              aria-label={`${name}: ${band}`}
              onClick={() => onChange(band)}
            >
              {band}
            </Button>
          ))}
        </div>
      )}
      {description ? (
        <div className="space-y-1 rounded-r-lg rounded-l-xs border-l-2 border-blue-500 bg-blue-50/30 p-3 dark:bg-blue-950/20">
          <p className="text-xs font-medium text-blue-700/80 dark:text-blue-300/80">{T.description}</p>
          <p className="text-sm leading-relaxed text-[var(--ink-primary)]">{description}</p>
        </div>
      ) : null}
    </fieldset>
  );
};
