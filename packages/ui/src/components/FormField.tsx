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
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wide text-[var(--ink-secondary)]"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-[var(--blush-action)]">
            *
          </span>
        )}
      </label>
    )}
    {children}
    {helperText && !error && <span className="text-xs text-[var(--ink-muted)]">{helperText}</span>}
    {error && <span className="text-xs text-[var(--blush-action)]">{error}</span>}
  </div>
);
