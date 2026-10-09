import type { ChangeEvent, ReactElement } from "react";
import { SearchIcon } from "./icons";
import { cn } from "../utils/cn";

export interface TableSearchControlProps {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  variant?: "default" | "table";
  className?: string;
}

export function TableSearchControl({
  ariaLabel,
  placeholder,
  value,
  onChange,
  variant = "default",
  className,
}: TableSearchControlProps): ReactElement {
  const isTable = variant === "table";

  return (
    <div
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-lg border px-3 transition-[border-color,box-shadow] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20",
        isTable
          ? "border-[var(--table-control-border)] bg-[var(--table-control-background)]"
          : "border-[var(--control-border)] bg-[var(--surface-card)]",
        className,
      )}
    >
      <SearchIcon
        className={cn(
          "h-4 w-4 shrink-0",
          isTable ? "text-[var(--table-muted-text)]" : "text-[var(--ink-muted)]",
        )}
      />
      <input
        type="search"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-sm outline-none",
          isTable
            ? "text-[var(--table-body-text)] placeholder:text-[var(--table-muted-text)]"
            : "text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)]",
        )}
      />
    </div>
  );
}

export interface TableFilterInputProps {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "default" | "table";
  className?: string;
}

export function TableFilterInput({
  ariaLabel,
  value,
  onChange,
  placeholder,
  variant = "default",
  className,
}: TableFilterInputProps): ReactElement {
  const isTable = variant === "table";
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <input
      type="text"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className={cn(
        "w-full min-w-0 rounded-lg border px-3 text-sm outline-none transition-[border-color,box-shadow] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20",
        isTable ? "h-8" : "h-9",
        isTable
          ? "border-[var(--table-control-border)] bg-[var(--table-control-background)] text-[var(--table-body-text)] placeholder:text-[var(--table-muted-text)]"
          : "border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)]",
        className,
      )}
    />
  );
}
