"use client";

import {
  useId,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  count?: string | number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export const Tabs = ({
  items,
  value,
  onChange,
  className,
  id,
  ariaLabel,
}: TabsProps): ReactElement => {
  const generatedTabsId = useId().replace(/:/g, "");
  const tabsId = id ?? generatedTabsId;
  const { t } = useLocale();
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number): void => {
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((item) => item.id === items[index]?.id);
    const nextIndex =
      event.key === "ArrowRight"
        ? (currentIndex + 1) % enabled.length
        : event.key === "ArrowLeft"
          ? (currentIndex - 1 + enabled.length) % enabled.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? enabled.length - 1
              : -1;
    if (nextIndex < 0) return;
    event.preventDefault();
    const next = enabled[nextIndex];
    onChange(next.id);
    document.getElementById(`${tabsId}-tab-${next.id}`)?.focus();
  };

  return (
    <div className={cn("border-b border-[var(--shell-border)]", className)}>
      <div
        className="flex min-w-0 gap-1 overflow-x-auto"
        role="tablist"
        aria-label={ariaLabel ?? t("common.sections", "Sections")}
      >
        {items.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              id={`${tabsId}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={selected ? `${tabsId}-panel-${item.id}` : undefined}
              disabled={item.disabled}
              onClick={() => onChange(item.id)}
              onKeyDown={(event) => handleKeyDown(event, items.indexOf(item))}
              className={cn(
                "relative inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-[var(--brand)] text-[var(--brand-ink)]"
                  : "border-transparent text-[var(--ink-secondary)] hover:border-[var(--shell-border)] hover:text-[var(--ink-primary)]",
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="rounded-full bg-[var(--surface-subtle)] px-1.5 py-0.5 text-xs text-[var(--ink-secondary)]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export interface TabPanelProps {
  id: string;
  active: boolean;
  children: ReactNode;
  /** Keep the panel mounted after its first visit so local filters/forms retain state. */
  keepMounted?: boolean;
  labelledBy?: string;
  className?: string;
}

export const TabPanel = ({
  id,
  active,
  children,
  keepMounted = false,
  labelledBy,
  className,
}: TabPanelProps): ReactElement | null => {
  if (!active && !keepMounted) return null;

  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      aria-hidden={!active || undefined}
      hidden={!active}
      className={className}
    >
      {children}
    </div>
  );
};
