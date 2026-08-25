import type { ReactElement, ReactNode } from "react";
import { cn } from "@pte/ui";

/** Shared input styling for the create-tenant form controls. */
export const fieldInputClass = (error?: string): string =>
  cn(
    "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500",
    error ? "border-red-300 bg-red-50/40" : "border-gray-300",
  );

interface TenantFormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const TenantFormField = ({
  label,
  htmlFor,
  required,
  helper,
  error,
  children,
  className,
}: TenantFormFieldProps): ReactElement => (
  <div className={cn("flex flex-col gap-1", className)}>
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error ? (
      <p className="text-xs text-red-600">{error}</p>
    ) : (
      helper && <p className="text-xs text-gray-400">{helper}</p>
    )}
  </div>
);
