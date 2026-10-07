import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: PageHeaderProps): ReactElement => (
  <div
    className={cn(
      // Mobile-first: stack vertically with a tight gap so the header
      // doesn't waste vertical space on phones (otherwise the page below
      // the fold is unreachable without scrolling). On `sm+` we line up
      // the title row and the actions row side-by-side so they share a
      // single visual baseline and the actions sit flush with the title.
      "flex flex-col gap-3",
      "sm:flex-row sm:items-start sm:justify-between sm:gap-4",
    )}
  >
    <div className="min-w-0">
      <h1 className="text-[20px] font-semibold leading-tight text-slate-900 sm:text-[21px]">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm leading-5 text-gray-600">{subtitle}</p>}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2 self-start sm:flex-nowrap sm:self-center">
        {actions}
      </div>
    )}
  </div>
);