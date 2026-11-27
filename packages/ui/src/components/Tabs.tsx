"use client";

import {
  useId,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale } from "../i18n";
import { PRIMARY_ACTION_SURFACE_CLASSES } from "../styles/interactiveClasses";
import { cn } from "../utils/cn";
import type { ChipTone } from "./Chip";

export type TabsVariant = "default" | "minimal" | "segmented";
export type TabsActiveVariant = "surface" | "primary";
export type TabsOrientation = "horizontal" | "vertical";

export type TabTone = ChipTone;

/** The dot in front of a tab's label, in the colour a fact has on every other screen. */
const TONE_DOT_CLASS: Record<TabTone, string> = {
  sky: "bg-[var(--sky-action)]",
  mint: "bg-[var(--mint-action)]",
  cream: "bg-[var(--cream-action)]",
  blush: "bg-[var(--blush-action)]",
  brand: "bg-[var(--brand)]",
  action: "bg-[var(--brand)]",
  neutral: "bg-[var(--ink-muted)]",
};

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** A coloured dot before the label, to tell tabs apart at a glance (e.g. one colour per exam section). */
  tone?: TabTone;
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
  /**
   * Mirrors the NextAdmin tabs primitive: card-like tabs or underline tabs. `segmented` is a compact switch: a grey
   * tray with the selected option raised, for choosing between views in a toolbar.
   */
  variant?: TabsVariant;
  /** Controls the selected trigger appearance for default card-like tabs. */
  activeVariant?: TabsActiveVariant;
  /**
   * `vertical` stacks the triggers in a side rail (Up/Down arrow keys) with the count
   * badge pushed to the right edge. It always uses the card-like look of `default`.
   */
  orientation?: TabsOrientation;
  /**
   * Vertical rails only: drops the rail's own border and grey tray, for a rail that already sits in a card, and marks
   * the selected item with an accent bar. The default keeps the boxed look every other screen uses.
   */
  flat?: boolean;
}

const tabRootStyles: Record<TabsVariant, string> = {
  default:
    "overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]",
  minimal: "",
  segmented: "inline-block",
};

const tabListWrapperStyles: Record<TabsVariant, string> = {
  default: "border-b border-[var(--shell-border)] p-3",
  minimal: "border-b border-[var(--shell-border)]",
  segmented: "",
};

const tabListStyles: Record<TabsVariant, string> = {
  default: "flex min-w-0 gap-1 overflow-x-auto rounded-lg bg-[var(--surface-subtle)] p-1",
  minimal: "flex min-w-0 gap-2 overflow-x-auto",
  segmented: "inline-flex min-w-0 gap-1 rounded-lg bg-[var(--surface-subtle)] p-1",
};

const verticalRootStyles =
  "overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]";
const verticalListWrapperStyles = "p-3";
const verticalListStyles = "flex min-w-0 flex-col gap-1 rounded-lg bg-[var(--surface-subtle)] p-1";
const verticalTriggerStyles = "w-full justify-start text-left";
const flatListStyles = "flex min-w-[12rem] flex-col gap-1";
const flatSelectedStyles =
  "relative rounded-md bg-[var(--surface-subtle)] px-3 py-2 font-semibold text-[var(--ink-primary)] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-[var(--brand)]";

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
  activeVariant = "surface",
  orientation = "horizontal",
  flat = false,
}: TabsProps): ReactElement => {
  const generatedTabsId = useId().replace(/:/g, "");
  const tabsId = id ?? generatedTabsId;
  const { t } = useLocale();
  const isVertical = orientation === "vertical";
  const isFlat = isVertical && flat;
  // Vertical rails always use the card-like look; `minimal` underlines only make sense in a row.
  const effectiveVariant: TabsVariant = isVertical ? "default" : variant;
  const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
  const previousKey = isVertical ? "ArrowUp" : "ArrowLeft";

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, itemId: string): void => {
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((item) => item.id === itemId);
    if (currentIndex < 0) return;
    const nextIndex =
      event.key === nextKey
        ? (currentIndex + 1) % enabled.length
        : event.key === previousKey
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
    <div className={cn(isFlat ? "" : isVertical ? verticalRootStyles : tabRootStyles[variant], className)}>
      <div className={isFlat ? "" : isVertical ? verticalListWrapperStyles : tabListWrapperStyles[variant]}>
        <div
          className={isFlat ? flatListStyles : isVertical ? verticalListStyles : tabListStyles[variant]}
          role="tablist"
          aria-orientation={orientation}
          aria-label={ariaLabel ?? t("common.sections", "Sections")}
        >
          {items.map((item) => {
            const selected = item.id === value;
            const badge = item.badge ?? item.count;
            const triggerStyles =
              effectiveVariant !== "minimal"
                ? selected
                  ? isFlat
                    ? flatSelectedStyles
                    : activeVariant === "primary"
                    ? `rounded-md px-3 py-2 ${PRIMARY_ACTION_SURFACE_CLASSES}`
                    : "rounded-md bg-[var(--tab-active-background)] px-3 py-2 text-[var(--ink-primary)] shadow-xs"
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
                className={cn(tabTriggerBaseStyles, triggerStyles, isVertical && verticalTriggerStyles)}
              >
                {item.tone && (
                  <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", TONE_DOT_CLASS[item.tone])} />
                )}
                {item.icon}
                {item.label}
                {badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full bg-[var(--surface-subtle)] px-1.5 py-0.5 text-xs text-[var(--ink-secondary)]",
                      isVertical && "ml-auto",
                    )}
                  >
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
