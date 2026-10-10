import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export interface TableRootProps extends ComponentProps<"table"> {
  fullBleed?: boolean;
}

export function TableRoot({ className, fullBleed = false, ...props }: TableRootProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "min-w-full border-separate border-spacing-0 text-left",
          fullBleed
            ? "border-y border-[var(--table-border)]"
            : "rounded-xl border border-[var(--table-border)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn(
        "bg-[var(--table-surface-background)] text-[var(--table-header-text)] [&_tr]:bg-[var(--table-surface-background)] [&_tr:not(:last-child)_th]:!border-b-0 [&_th]:border-b [&_th]:border-[var(--table-border)] [&_th]:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("bg-[var(--table-surface-background)]", className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-xs leading-4 font-semibold text-[var(--table-header-text)] sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "not-last:*:border-[var(--table-border)] not-last:[&>td]:border-b not-last:[&>th]:border-b",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "px-4 py-3.5 text-sm leading-5 tracking-[-0.15px] text-[var(--table-body-text)] sm:px-6",
        className,
      )}
      {...props}
    />
  );
}
