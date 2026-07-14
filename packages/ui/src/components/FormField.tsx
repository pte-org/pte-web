import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

interface FormFieldProps {
  id?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const FormField = ({
  id,
  label,
  error,
  helperText,
  required = false,
  children,
  className,
}: FormFieldProps): ReactElement => (
  <div className={cn("flex flex-col gap-1", className)}>
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>
    )}
    {children}
    {helperText && !error && (
      <span className="text-sm text-gray-500">{helperText}</span>
    )}
    {error && <span className="text-sm text-red-600">{error}</span>}
  </div>
);
