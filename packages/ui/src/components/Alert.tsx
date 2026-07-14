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
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

export const Alert = ({
  tone = "info",
  title,
  children,
  className,
}: AlertProps): ReactElement => (
  <div className={cn("rounded-md border px-4 py-3", TONE_CLASS[tone], className)}>
    {title && <h3 className="text-sm font-semibold">{title}</h3>}
    <div className={cn("text-sm", title && "mt-1")}>{children}</div>
  </div>
);
