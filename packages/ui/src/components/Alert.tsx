import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export type AlertTone = "info" | "success" | "warning" | "error";

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  /** Small icon before the message; leave unset for the plain alert. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const TONE_CLASS: Record<AlertTone, string> = {
  info: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
  success: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
  warning: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
  error: "bg-[var(--blush-tint)] text-[var(--blush-action)]",
};

export const Alert = ({ tone = "info", title, icon, children, className }: AlertProps): ReactElement => (
  <div className={cn("rounded-md px-4 py-3", icon ? "flex items-start gap-3" : undefined, TONE_CLASS[tone], className)}>
    {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
    <div>
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      <div className={cn("text-sm", title && "mt-1")}>{children}</div>
    </div>
  </div>
);
