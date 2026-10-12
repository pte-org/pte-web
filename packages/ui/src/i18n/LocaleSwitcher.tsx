"use client";

import type { ReactElement } from "react";
import { Dropdown, type DropdownItem } from "../components/Dropdown";
import { ChevronDownIcon } from "../components/icons";
import { cn } from "../utils/cn";
import { useLocale } from "./LocaleProvider";

export const LocaleSwitcher = ({ className }: { className?: string }): ReactElement => {
  const { locale, setLocale, t } = useLocale();
  const items: DropdownItem[] = [
    { label: "VI", onSelect: () => setLocale("vi") },
    { label: "EN", onSelect: () => setLocale("en") },
  ];

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Dropdown
        items={items}
        label={t("common.language", "Language")}
        menuClassName="!w-[62px] !min-w-[62px]"
        triggerClassName="!flex !h-10 !w-auto !min-w-[62px] items-center justify-between gap-2 border border-[var(--control-border)] bg-[var(--surface-card)] px-3 text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)] hover:border-[var(--brand)] hover:bg-[var(--surface-subtle)]"
        trigger={
          <>
            <span>{locale.toUpperCase()}</span>
            <ChevronDownIcon className="h-4 w-4 text-[var(--ink-muted)]" />
          </>
        }
      />
    </div>
  );
};
