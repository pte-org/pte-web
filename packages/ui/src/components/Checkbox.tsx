import type { InputHTMLAttributes, ReactElement } from "react";
import { cn } from "../utils/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  helperText?: string;
  error?: string;
}

export const Checkbox = ({
  id,
  label,
  helperText,
  error,
  className,
  ...props
}: CheckboxProps): ReactElement => (
  <div className="flex flex-col gap-1">
    <label className="flex items-start gap-2 text-sm text-gray-700" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={cn(
          "mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      <span>{label}</span>
    </label>
    {helperText && !error && (
      <span className="pl-6 text-sm text-gray-500">{helperText}</span>
    )}
    {error && <span className="pl-6 text-sm text-red-600">{error}</span>}
  </div>
);
