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
            ? "border-y border-[var(--shell-border)]"
            : "rounded-xl border border-[var(--shell-border)]",
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
        "text-[var(--ink-secondary)] [&_th]:border-b [&_th]:border-[var(--divider)] [&_th]:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("bg-[var(--surface-card)]", className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn("px-5 py-3.5 font-medium text-[var(--ink-secondary)]", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "not-last:*:border-[var(--divider)] not-last:[&>td]:border-b not-last:[&>th]:border-b",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn("px-5 py-3.5 text-sm text-[var(--ink-primary)]", className)}
      {...props}
    />
  );
}
