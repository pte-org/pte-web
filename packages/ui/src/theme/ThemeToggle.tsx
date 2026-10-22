"use client";

import type { MouseEvent, ReactElement } from "react";
import { cn } from "../utils/cn";
import { MoonIcon, SunIcon } from "../components/icons";
import { useLocale } from "../i18n";
import { useTheme } from "./ThemeProvider";

const REVEAL_DURATION_MS = 600;
const REVEAL_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * Reveals the new theme as a circle growing from the clicked button. Falls back to an instant
 * switch where the View Transitions API is unavailable.
 */
const revealThemeFrom = (button: HTMLElement, switchTheme: () => void): void => {
  if (typeof document.startViewTransition !== "function") {
    switchTheme();
    return;
  }
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  // Distance to the farthest viewport corner, so the circle always covers the whole screen.
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const transition = document.startViewTransition(switchTheme);
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: REVEAL_DURATION_MS,
          easing: REVEAL_EASING,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      // A skipped transition (e.g. a second click mid-animation) has already applied the theme.
    });
};

export const ThemeToggle = ({ className }: { className?: string }): ReactElement => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    revealThemeFrom(event.currentTarget, toggleTheme);
  };

  return (
    <button
      type="button"
      aria-label={
        isDark ? t("common.lightTheme", "Light theme") : t("common.darkTheme", "Dark theme")
      }
      aria-pressed={isDark}
      title={isDark ? t("common.lightTheme", "Light theme") : t("common.darkTheme", "Dark theme")}
      onClick={handleClick}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-lg border border-[var(--shell-border)] bg-[var(--shell-frame)] text-[var(--ink-primary)] shadow-xs transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 focus-visible:ring-offset-1",
        className,
      )}
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
};
