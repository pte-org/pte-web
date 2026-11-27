"use client";
import { useState, type ReactElement } from "react";
import { NumberInput } from "@pte/ui";

interface TraitNumberInputProps {
  traitKey: string;
  label: string;
  maxScore: number;
  value: number | null | undefined;
  /** The AI's level, passed only once the examiner may see it (blind marking). */
  aiLevel?: number;
  aiLabel: string;
  disabled: boolean;
  onChange?: (value: number) => void;
}

const INTEGER_PATTERN = /^\d+$/;
const textOf = (value: number | null | undefined): string =>
  value === null || value === undefined ? "" : String(value);

/** One whole-number field (0..maxScore) for traits with too many bands to list as cards. */
export const TraitNumberInput = ({ traitKey, label, maxScore, value, aiLevel, aiLabel, disabled, onChange }:
  TraitNumberInputProps): ReactElement => {
  const [draft, setDraft] = useState(textOf(value));
  // A new value from outside (another examiner's save, a reset) replaces what is typed, during render, not in an effect.
  const [shownValue, setShownValue] = useState(value);
  if (shownValue !== value) {
    setShownValue(value);
    setDraft(textOf(value));
  }

  const handleChange = (raw: string): void => {
    setDraft(raw);
    if (!INTEGER_PATTERN.test(raw)) return;
    const parsed = Number(raw);
    if (parsed <= maxScore) onChange?.(parsed);
  };
  const handleBlur = (): void => {
    if (!INTEGER_PATTERN.test(draft)) {
      setDraft(textOf(value));
      return;
    }
    const clamped = Math.min(Math.max(Number(draft), 0), maxScore);
    setDraft(String(clamped));
    if (clamped !== value) onChange?.(clamped);
  };

  return <div className="flex items-center gap-3">
    <div className="w-28">
      <NumberInput id={`trait-${traitKey}`} aria-label={label} inputMode="numeric" min={0} max={maxScore} step={1}
        value={draft} disabled={disabled} onChange={(event) => handleChange(event.target.value)} onBlur={handleBlur}
        onKeyDown={(event) => { if (["e", "E", "+", "-", ".", ","].includes(event.key)) event.preventDefault(); }} />
    </div>
    <span className="text-sm tabular-nums text-[var(--ink-muted)]">/ {maxScore}</span>
    {aiLevel !== undefined && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
      {aiLabel} {aiLevel}</span>}
  </div>;
};
