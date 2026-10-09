import type { InputHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { DatePicker, DateTimePicker, type DatePickerProps } from "./DatePicker";
import { FormField } from "./FormField";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
}

export const Input = ({
  id,
  label,
  error,
  helperText,
  leftIcon,
  rightAction,
  className,
  required,
  ...props
}: InputProps): ReactElement => {
  const controlId = id ?? props.name?.toString() ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormField
      id={controlId}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
    >
      <div
        className={cn(
          "flex min-h-10 items-center gap-2 rounded-lg border bg-[var(--surface-card)] px-3 transition-[border-color,box-shadow] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20",
          error ? "border-[var(--blush-action)]" : "border-[var(--control-border)]",
        )}
      >
        {leftIcon && <span className="text-[var(--ink-muted)]">{leftIcon}</span>}
        <input
          id={controlId}
          required={required}
          className={cn(
            "min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-muted)]",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {rightAction}
      </div>
    </FormField>
  );
};

export const TextInput = Input;

export const DateInput = (props: DatePickerProps): ReactElement => <DatePicker {...props} />;

export const DateTimeInput = (props: Omit<DatePickerProps, "includeTime">): ReactElement => (
  <DateTimePicker {...props} />
);

export const NumberInput = (props: Omit<InputProps, "type">): ReactElement => (
  <Input {...props} type="number" />
);
