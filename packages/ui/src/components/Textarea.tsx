import type { ReactElement, TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { FormField } from "./FormField";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = ({
  id,
  label,
  error,
  helperText,
  className,
  required,
  ...props
}: TextareaProps): ReactElement => (
  <FormField
    id={id}
    label={label}
    error={error}
    helperText={helperText}
    required={required}
  >
    <textarea
      id={id}
      required={required}
      className={cn(
        "min-h-24 rounded-md border bg-white px-3 py-2 text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500",
        error ? "border-red-500" : "border-gray-300",
        className,
      )}
      aria-invalid={error ? true : undefined}
      {...props}
    />
  </FormField>
);
