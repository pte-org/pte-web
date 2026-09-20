"use client";

import { useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  contentClassName?: string;
}

export const CollapsibleSection = ({
  title,
  subtitle,
  children,
  defaultExpanded = true,
  className,
  contentClassName,
}: CollapsibleSectionProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sectionId = useId().replace(/:/g, "");
  const titleId = `collapsible-section-title-${sectionId}`;
  const contentId = `collapsible-section-content-${sectionId}`;

  return (
    <section aria-labelledby={titleId} className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-sm font-semibold text-slate-800">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-action shadow-sm transition-colors hover:border-action hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? "Collapse" : "Expand"}
          <span aria-hidden="true" className="text-base leading-none">
            {isExpanded ? "−" : "+"}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div id={contentId} className={contentClassName}>
          {children}
        </div>
      )}
    </section>
  );
};
