import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  success: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
  warning: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
  danger: "bg-[var(--blush-tint)] text-[var(--blush-action)]",
  info: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
  neutral: "bg-[var(--surface-subtle)] text-[var(--ink-secondary)]",
};

export const Badge = ({ variant = "neutral", children, className }: BadgeProps): ReactElement => (
  <span
    className={cn(
      "before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-current inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
      VARIANT_CLASS[variant],
      className,
    )}
  >
    {children}
  </span>
);
