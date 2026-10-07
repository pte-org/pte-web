import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, subtitle, actions, className }: PageHeaderProps): ReactElement => (
  <div
    className={cn(
      "flex flex-col gap-4 motion-safe:animate-pte-fade-up sm:flex-row sm:items-end sm:justify-between",
      className,
    )}
  >
    <div>
      <h1 className="text-[28px] font-medium leading-8 tracking-[-0.025em] text-slate-950">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>}
  </div>
);
