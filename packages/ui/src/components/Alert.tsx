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
  info: "bg-sky-50 text-sky-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
};

export const Alert = ({ tone = "info", title, children, className }: AlertProps): ReactElement => (
  <div className={cn("rounded-md px-4 py-3", TONE_CLASS[tone], className)}>
    {title && <h3 className="text-sm font-semibold">{title}</h3>}
    <div className={cn("text-sm", title && "mt-1")}>{children}</div>
  </div>
);
