import type { ReactElement } from "react";

interface LevelPickerProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

/** Every level from 0 to max as a row of buttons, so a trait is set in one click instead of several +/− presses. */
export const LevelPicker = ({ label, value, max, onChange }: LevelPickerProps): ReactElement => (
  <div role="radiogroup" aria-label={label} className="flex shrink-0 gap-1">
    {Array.from({ length: max + 1 }, (_, level) => (
      <button
        key={level}
        type="button"
        role="radio"
        aria-checked={level === value}
        onClick={() => onChange(level)}
        className={`h-8 min-w-8 rounded-md border px-2 text-sm font-semibold tabular-nums transition-colors ${
          level === value
            ? "border-action bg-action text-white"
            : "border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:border-action hover:text-action"
        }`}
      >
        {level}
      </button>
    ))}
  </div>
);
