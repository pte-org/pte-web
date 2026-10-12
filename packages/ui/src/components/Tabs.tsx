"use client";

import {
  useId,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";

export type TabsVariant = "default" | "minimal";

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  count?: string | number;
  badge?: string | number;
}

export interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  ariaLabel?: string;
  /** Mirrors the NextAdmin tabs primitive: card-like tabs or underline tabs. */
  variant?: TabsVariant;
}

const tabRootStyles: Record<TabsVariant, string> = {
  default:
    "overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]",
  minimal: "",
};

const tabListWrapperStyles: Record<TabsVariant, string> = {
  default: "border-b border-[var(--shell-border)] p-3",
  minimal: "border-b border-[var(--shell-border)]",
};

const tabListStyles: Record<TabsVariant, string> = {
  default: "flex min-w-0 gap-1 overflow-x-auto rounded-lg bg-[var(--surface-subtle)] p-1",
  minimal: "flex min-w-0 gap-2 overflow-x-auto",
};

const tabTriggerBaseStyles =
  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 disabled:cursor-not-allowed disabled:opacity-50";

export const Tabs = ({
  items,
  value,
  onChange,
  className,
  id,
  ariaLabel,
  variant = "default",
}: TabsProps): ReactElement => {
  const generatedTabsId = useId().replace(/:/g, "");
  const tabsId = id ?? generatedTabsId;
  const { t } = useLocale();

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, itemId: string): void => {
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((item) => item.id === itemId);
    if (currentIndex < 0) return;
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
    <div className={cn(tabRootStyles[variant], className)}>
      <div className={tabListWrapperStyles[variant]}>
        <div
          className={tabListStyles[variant]}
          role="tablist"
          aria-label={ariaLabel ?? t("common.sections", "Sections")}
        >
          {items.map((item) => {
            const selected = item.id === value;
            const badge = item.badge ?? item.count;
            const triggerStyles =
              variant === "default"
                ? selected
                  ? "rounded-md bg-[var(--surface-card)] px-3 py-2 text-[var(--ink-primary)] shadow-xs"
                  : "rounded-md px-3 py-2 text-[var(--ink-secondary)] hover:bg-[var(--surface-card)]/70 hover:text-[var(--ink-primary)]"
                : selected
                  ? "border-b-2 border-[var(--brand)] px-3 py-3.5 text-[var(--brand-ink)]"
                  : "border-b-2 border-transparent px-3 py-3.5 text-[var(--ink-secondary)] hover:border-[var(--shell-border)] hover:text-[var(--ink-primary)]";

            return (
              <button
                key={item.id}
                id={`${tabsId}-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${tabsId}-panel-${item.id}`}
                tabIndex={selected && !item.disabled ? 0 : -1}
                disabled={item.disabled}
                onClick={() => onChange(item.id)}
                onKeyDown={(event) => handleKeyDown(event, item.id)}
                className={cn(tabTriggerBaseStyles, triggerStyles)}
              >
                {item.icon}
                {item.label}
                {badge !== undefined && (
                  <span className="rounded-full bg-[var(--surface-subtle)] px-1.5 py-0.5 text-xs text-[var(--ink-secondary)]">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
