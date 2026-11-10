import type { ReactElement } from "react";
import { cn } from "../utils/cn";

interface RadioCardProps {
  name: string;
  label: string;
  /** A muted line under the label that says what choosing it does. */
  hint?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}

/** One choice of a set where exactly one applies, drawn as a bordered card that lights up when chosen. */
export const RadioCard = ({
  name,
  label,
  hint,
  checked,
  onChange,
  disabled = false,
  className,
}: RadioCardProps): ReactElement => (
  <label
    className={cn(
      "flex cursor-pointer items-start gap-2 rounded-lg border bg-[var(--surface-card)] p-3 transition-colors",
      checked ? "border-[var(--action)] bg-[var(--action-tint)]" : "border-[var(--shell-border)]",
      disabled && "cursor-not-allowed opacity-60",
      className,
    )}
  >
    <input
      type="radio"
      name={name}
      className="mt-1"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
    />
    <span>
      <span className="block text-sm font-medium text-[var(--ink-primary)]">{label}</span>
      {hint && <span className="block text-xs text-[var(--ink-muted)]">{hint}</span>}
    </span>
  </label>
);
