import type { InputHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
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
  const controlId =
    id ?? props.name?.toString() ?? label?.toLowerCase().replace(/\s+/g, "-");

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
          "flex items-center gap-2 rounded-md border bg-white px-3 transition-colors focus-within:ring-2 focus-within:ring-blue-500",
          error ? "border-red-500" : "border-gray-300",
        )}
      >
        {leftIcon && <span className="text-gray-400">{leftIcon}</span>}
        <input
          id={controlId}
          required={required}
          className={cn(
            "min-w-0 flex-1 bg-transparent py-2 text-base text-gray-900 outline-none placeholder:text-gray-400",
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

export const DateInput = (props: Omit<InputProps, "type">): ReactElement => (
  <Input {...props} type="date" />
);

export const NumberInput = (props: Omit<InputProps, "type">): ReactElement => (
  <Input {...props} type="number" />
);
