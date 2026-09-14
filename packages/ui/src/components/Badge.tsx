import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
  neutral: "bg-gray-100 text-gray-600",
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
