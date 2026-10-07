"use client";

import type { ReactElement } from "react";
import { cn } from "../utils/cn";
import { useLocale, type Locale } from "./LocaleProvider";

export const LocaleSwitcher = ({ className }: { className?: string }): ReactElement => {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t("common.language", "Language")}</span>
      <select
        aria-label={t("common.language", "Language")}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="h-10 appearance-none rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] py-2 pl-3 pr-8 text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)] outline-none transition-colors hover:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
      >
        <option value="vi">VI</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
};
