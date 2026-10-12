"use client";

import { Command } from "cmdk";
import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { useLocale } from "../i18n";
import { SearchIcon } from "./icons";

export interface HeaderSearchItem {
  id: string;
  title: string;
  parentTitle?: string;
  section: string;
  url: string;
  icon?: ReactNode;
}

export interface HeaderSearchProps {
  items?: readonly HeaderSearchItem[];
  placeholder?: string;
  onNavigate?: (url: string) => void;
}

const searchFieldClassName =
  "flex h-10 w-full items-center gap-2 rounded-lg border border-[var(--control-border)] bg-[var(--surface-card)] px-3 transition-[border-color,box-shadow] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20";

const KeyboardHint = ({ children }: { children: ReactNode }): ReactElement => (
  <kbd className="rounded-md border border-[var(--shell-border)] bg-[var(--surface-subtle)] px-2 py-0.75 text-xs text-[var(--ink-muted)]">
    {children}
  </kbd>
);

export const HeaderSearch = ({
  items = [],
  placeholder,
  onNavigate,
}: HeaderSearchProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();
  const resolvedPlaceholder = placeholder ?? t("common.searchPages", "Search pages...");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const itemsBySection = useMemo(() => {
    const sections: Record<string, HeaderSearchItem[]> = {};

    for (const item of items) {
      const section = item.section || "Pages";
      sections[section] ??= [];
      sections[section].push(item);
    }

    return sections;
  }, [items]);

  const handleSelect = (url: string): void => {
    setOpen(false);
    if (onNavigate) {
      onNavigate(url);
      return;
    }

    window.location.assign(url);
  };

  return (
    <>
      <button
        type="button"
        aria-label={t("common.openSearch", "Open search")}
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg border border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-primary)] shadow-xs transition-colors outline-none hover:bg-[var(--surface-subtle)] focus-visible:border-[var(--brand)] focus-visible:ring-4 focus-visible:ring-[var(--brand)]/20 md:hidden"
      >
        <SearchIcon className="size-4" />
      </button>

      <div className="hidden md:block">
        <button
          type="button"
          aria-label={resolvedPlaceholder}
          onClick={() => setOpen(true)}
          className="w-full text-left outline-none focus:outline-none"
        >
          <div className={cn(searchFieldClassName, "cursor-pointer")}>
            <SearchIcon className="size-4 shrink-0 text-[var(--ink-muted)]" />
            <span className="min-w-0 flex-1 truncate pl-1 text-sm text-[var(--ink-muted)]">
              {resolvedPlaceholder}
            </span>
            <KeyboardHint>
              <span className="font-medium">⌘</span> K
            </KeyboardHint>
          </div>
        </button>
      </div>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label={t("common.globalSearch", "Global Search")}
        overlayClassName="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        contentClassName="fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] text-[var(--ink-primary)] shadow-2xl outline-none max-sm:max-w-[calc(100%-2rem)]"
      >
        <div className="border-b border-[var(--shell-border)] p-3.5">
          <div className={cn(searchFieldClassName, "!bg-[var(--surface-card)]")}>
            <SearchIcon className="size-4 shrink-0 text-[var(--ink-muted)]" />
            <Command.Input
              autoFocus
              placeholder={resolvedPlaceholder}
              className="w-full min-w-0 flex-1 border-none bg-transparent pl-1 text-sm text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-muted)] focus:ring-0 focus:outline-none"
            />
            <KeyboardHint>ESC</KeyboardHint>
          </div>
        </div>

        <Command.List className="scrollbar-thin max-h-96 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-[var(--ink-muted)]">
            {t("common.noPagesFound", "No pages found matching your search.")}
          </Command.Empty>

          {Object.entries(itemsBySection).map(([section, sectionItems]) => (
            <Command.Group
              key={section}
              heading={section}
              className="py-1.5 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:tracking-wider **:[[cmdk-group-heading]]:text-[var(--ink-muted)] **:[[cmdk-group-heading]]:uppercase"
            >
              {sectionItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.section} ${item.parentTitle ?? ""} ${item.title} ${item.url}`}
                  onSelect={() => handleSelect(item.url)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[var(--ink-secondary)] transition-colors hover:bg-[var(--surface-subtle)] data-[selected=true]:bg-[var(--surface-subtle)] data-[selected=true]:text-[var(--ink-primary)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.icon && (
                      <span className="flex size-5 shrink-0 items-center justify-center text-[var(--ink-secondary)]">
                        {item.icon}
                      </span>
                    )}
                    <div className="flex min-w-0 items-center gap-1.5 truncate">
                      {item.parentTitle && (
                        <span className="truncate font-normal text-[var(--ink-muted)]">
                          {item.parentTitle} /
                        </span>
                      )}
                      <span className="truncate text-[var(--ink-primary)]">{item.title}</span>
                    </div>
                  </div>
                  <span className="hidden shrink-0 text-xs text-[var(--ink-muted)] sm:inline">
                    {item.url}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>

        <div className="flex items-center justify-between border-t border-[var(--shell-border)] bg-[var(--surface-subtle)] px-4 py-2.5 text-xs text-[var(--ink-muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--shell-border)] bg-[var(--surface-card)] px-1 py-0.5 font-mono text-[10px] shadow-xs">
                ↑
              </kbd>
              <kbd className="rounded border border-[var(--shell-border)] bg-[var(--surface-card)] px-1 py-0.5 font-mono text-[10px] shadow-xs">
                ↓
              </kbd>
              <span>{t("common.navigate", "Navigate")}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--shell-border)] bg-[var(--surface-card)] px-1.5 py-0.5 font-mono text-[10px] shadow-xs">
                ↵
              </kbd>
              <span>{t("common.select", "Select")}</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--shell-border)] bg-[var(--surface-card)] px-1.5 py-0.5 font-mono text-[10px] shadow-xs">
              ESC
            </kbd>
            <span>{t("common.close", "Close")}</span>
          </span>
        </div>
      </Command.Dialog>
    </>
  );
};
