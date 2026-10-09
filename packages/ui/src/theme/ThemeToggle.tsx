"use client";

import type { ReactElement } from "react";
import { cn } from "../utils/cn";
import { MoonIcon, SunIcon } from "../components/icons";
import { useLocale } from "../i18n";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle = ({ className }: { className?: string }): ReactElement => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? t("common.lightTheme", "Light theme") : t("common.darkTheme", "Dark theme")}
      aria-pressed={isDark}
      title={isDark ? t("common.lightTheme", "Light theme") : t("common.darkTheme", "Dark theme")}
      onClick={toggleTheme}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-lg text-[var(--ink-secondary)] transition-colors hover:bg-[var(--brand-tint)] hover:text-[var(--brand-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
        className,
      )}
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
};
