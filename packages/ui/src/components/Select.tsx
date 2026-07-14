import type { ReactElement, SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { FormField } from "./FormField";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = ({
  id,
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  required,
  ...props
}: SelectProps): ReactElement => (
  <FormField
    id={id}
    label={label}
    error={error}
    helperText={helperText}
    required={required}
  >
    <select
      id={id}
      required={required}
      className={cn(
        "rounded-md border bg-white px-3 py-2 text-base text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-blue-500",
        error ? "border-red-500" : "border-gray-300",
        className,
      )}
      aria-invalid={error ? true : undefined}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  </FormField>
);
