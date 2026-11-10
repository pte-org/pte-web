import type { InputHTMLAttributes, ReactElement } from "react";
import { cn } from "../utils/cn";

interface TableNumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  /** What the field is, for assistive technology: a table cell has no visible label of its own. */
  "aria-label": string;
  /** Width of the field; weights and counts are short numbers, so a cell needs little room. */
  width?: "sm" | "md";
}

const WIDTH: Record<NonNullable<TableNumberInputProps["width"]>, string> = {
  sm: "w-14",
  md: "w-20",
};

/**
 * A number field made to sit inside a table cell: the control border and surface of the other fields, a compact
 * height, and no spin buttons, which would take a sixth of a field this narrow. The arrow keys still step it.
 */
export const TableNumberInput = ({
  width = "md",
  className,
  ...props
}: TableNumberInputProps): ReactElement => (
  <input
    type="number"
    className={cn(
      "rounded-md border border-[var(--control-border)] bg-[var(--surface-card)] px-2 py-1 text-sm text-[var(--ink-primary)] outline-none transition-[border-color,box-shadow] [appearance:textfield] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 disabled:border-transparent disabled:bg-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      WIDTH[width],
      className,
    )}
    {...props}
  />
);
