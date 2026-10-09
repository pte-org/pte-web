import type { ChangeEvent, ReactElement } from "react";
import { SearchIcon } from "./icons";
import { cn } from "../utils/cn";

export interface TableSearchControlProps {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TableSearchControl({
  ariaLabel,
  placeholder,
  value,
  onChange,
  className,
}: TableSearchControlProps): ReactElement {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-lg border border-[var(--control-border)] bg-[var(--surface-card)] px-3 transition-[border-color,box-shadow] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20",
        className,
      )}
    >
      <SearchIcon className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
      <input
        type="search"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-muted)]"
      />
    </div>
  );
}

export interface TableFilterInputProps {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TableFilterInput({
  ariaLabel,
  value,
  onChange,
  placeholder,
  className,
}: TableFilterInputProps): ReactElement {
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
        "h-9 w-full min-w-0 rounded-lg border border-[var(--control-border)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--ink-muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20",
        className,
      )}
    />
  );
}
