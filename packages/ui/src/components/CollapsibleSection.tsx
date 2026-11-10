"use client";

import { useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { DisclosureChevron } from "./DisclosureChevron";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  contentClassName?: string;
}

export const CollapsibleSection = ({
  title,
  subtitle,
  actions,
  children,
  collapsible = true,
  defaultExpanded = true,
  className,
  contentClassName,
}: CollapsibleSectionProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sectionId = useId().replace(/:/g, "");
  const titleId = `collapsible-section-title-${sectionId}`;
  const contentId = `collapsible-section-content-${sectionId}`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex flex-col gap-3 motion-safe:animate-pte-fade-up", className)}
    >
      <div className="flex items-center justify-between gap-3">
        {collapsible ? (
          <div className="min-w-0 flex-1">
            <h2 id={titleId}>
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={contentId}
                onClick={() => setIsExpanded((current) => !current)}
                className="flex min-h-10 w-full items-center gap-1 rounded-lg px-2 text-left transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--ink-primary)]">
                    {title}
                  </span>
                </span>
                <DisclosureChevron expanded={isExpanded} />
              </button>
            </h2>
            {subtitle && (
              <p className="mt-1 px-2 text-xs text-[var(--ink-secondary)]">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="min-w-0">
            <h2 id={titleId} className="text-sm font-semibold text-[var(--ink-primary)]">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-xs text-[var(--ink-secondary)]">{subtitle}</p>}
          </div>
        )}
        {actions && <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>}
      </div>

      {(!collapsible || isExpanded) && (
        <div id={contentId} className={contentClassName}>
          {children}
        </div>
      )}
    </section>
  );
};
