"use client";

import { useId, type ReactElement } from "react";
import { Input } from "./Input";

interface TypedConfirmInputProps {
  /** The exact string the user must type. Comparison is case-sensitive. */
  expectedValue: string;
  /** Label for the field. Rendered above the input by `Input`. */
  label: string;
  /** Current value — the caller owns the state so it can gate its submit button. */
  value: string;
  onValueChange: (next: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

/**
 * A "type to confirm" guard for irreversible actions.
 *
 * Used where clicking through is too easy — e.g. transferring or merging into a Class
 * that is not ACTIVE, where the write succeeds but the student effectively drops out of
 * the flow. Distinct from `ConfirmDialog`, which only asks for a click: this one
 * requires reproducing an exact string.
 *
 * Controlled by design. The caller holds the value because it also owns the submit gate
 * (`disabled={!isTypedConfirmValid(value, expectedValue)}`); an uncontrolled input would
 * hide the match state from the button that depends on it.
 *
 * The match is exact and case-sensitive — deliberately not trimmed or case-folded, so a
 * stray space or wrong-case character does not read as confirmation.
 */
export function isTypedConfirmValid(value: string, expectedValue: string): boolean {
  return value === expectedValue;
}

export const TypedConfirmInput = ({
  expectedValue,
  label,
  value,
  onValueChange,
  placeholder,
  helperText,
  error,
  disabled = false,
}: TypedConfirmInputProps): ReactElement => {
  const generatedId = useId();
  const matched = isTypedConfirmValid(value, expectedValue);

  return (
    <Input
      id={generatedId}
      label={label}
      value={value}
      disabled={disabled}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      autoComplete="off"
      aria-invalid={matched ? false : undefined}
      onChange={(event) => onValueChange(event.target.value)}
    />
  );
};
