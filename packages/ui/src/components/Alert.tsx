import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export type AlertTone = "info" | "success" | "warning" | "error";

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

const TONE_CLASS: Record<AlertTone, string> = {
  info: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
  success: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
  warning: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
  error: "bg-[var(--blush-tint)] text-[var(--blush-action)]",
};

export const Alert = ({ tone = "info", title, children, className }: AlertProps): ReactElement => (
  <div className={cn("rounded-md px-4 py-3", TONE_CLASS[tone], className)}>
    {title && <h3 className="text-sm font-semibold">{title}</h3>}
    <div className={cn("text-sm", title && "mt-1")}>{children}</div>
  </div>
);
