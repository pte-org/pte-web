"use client";
import type { ReactElement } from "react";
import { cn } from "@pte/ui";

interface TraitLevelPickerProps {
  traitKey: string;
  maxScore: number;
  levels: { level: number; text: string }[];
  value: number | null | undefined;
  /** The AI's level, passed only once the examiner may see it (blind marking). */
  aiLevel?: number;
  aiLabel: string;
  disabled: boolean;
  onChange?: (value: number) => void;
}

/** Every band of one trait as a clickable card with its Score Guide description, highest band first. */
export const TraitLevelPicker = ({ traitKey, maxScore, levels, value, aiLevel, aiLabel, disabled, onChange }:
  TraitLevelPickerProps): ReactElement => {
  const bands = Array.from({ length: maxScore + 1 }, (_, index) => maxScore - index);
  return <div role="radiogroup" aria-label={traitKey} className="grid gap-1.5">
    {bands.map((band) => {
      const selected = value === band;
      const isAi = aiLevel === band;
      return <button key={band} type="button" role="radio" aria-checked={selected} disabled={disabled}
        id={`trait-${traitKey}-${band}`} onClick={() => onChange?.(band)}
        className={cn("grid grid-cols-[2rem_1fr_auto] items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs",
          "transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          selected ? "border-[var(--action)] bg-[var(--action-tint)]" : "border-[var(--border-subtle)] hover:border-[var(--action)]",
          isAi && "border-l-4 border-l-violet-500")}>
        <span className="text-center text-base font-bold tabular-nums">{band}</span>
        <span className="text-[var(--ink-secondary)]">{levels.find((entry) => entry.level === band)?.text ?? ""}</span>
        {isAi ? <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">{aiLabel}</span> : <span />}
      </button>;
    })}
  </div>;
};
