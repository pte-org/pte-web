"use client";

import { useId, useState, type ReactElement, type ReactNode } from "react";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  contentClassName?: string;
}

export const CollapsibleSection = ({
  title,
  subtitle,
  actions,
  children,
  defaultExpanded = true,
  className,
  contentClassName,
}: CollapsibleSectionProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sectionId = useId().replace(/:/g, "");
  const { t } = useLocale();
  const titleId = `collapsible-section-title-${sectionId}`;
  const contentId = `collapsible-section-content-${sectionId}`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex flex-col gap-3 motion-safe:animate-pte-fade-up", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-sm font-semibold text-[var(--ink-primary)]">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs text-[var(--ink-secondary)]">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={contentId}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] px-3 text-sm font-medium text-[var(--ink-primary)] shadow-none transition-[background-color,border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:bg-[var(--surface-subtle)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-2 active:translate-y-0"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? t("common.collapse", "Collapse") : t("common.expand", "Expand")}
            <span aria-hidden="true" className="text-base leading-none">
              {isExpanded ? "−" : "+"}
            </span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div id={contentId} className={contentClassName}>
          {children}
        </div>
      )}
    </section>
  );
};
