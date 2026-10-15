"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSessionManager, useLocale, cn } from "@pte/ui";
import { resolveWorkspace } from "../resolveWorkspace";

export const WorkspaceSwitcher = (): ReactElement | null => {
  const pathname = usePathname();
  const { session } = useSessionManager();
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.roles || session.roles.length === 0) {
    return null;
  }

  const { allowedWorkspaces } = resolveWorkspace(session.roles);
  if (allowedWorkspaces.length <= 1) {
    return null;
  }

  const currentWorkspace = allowedWorkspaces.find((ws) =>
    pathname.startsWith(ws.href.split("/")[1] ? `/${ws.href.split("/")[1]}` : ws.href),
  ) ?? allowedWorkspaces[0];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-base)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-secondary)] shadow-sm hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]"
        aria-expanded={isOpen}
      >
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        <span>{t(currentWorkspace.labelKey, currentWorkspace.defaultLabel)}</span>
        <svg
          className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 w-44 origin-top-right rounded-md border border-[var(--border-subtle)] bg-[var(--surface-base)] py-1 shadow-lg focus:outline-none"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            {t("workspace.switchTitle", "Chuyển không gian")}
          </div>
          {allowedWorkspaces.map((ws) => {
            const isSelected = ws.id === currentWorkspace.id;
            return (
              <Link
                key={ws.id}
                href={ws.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                  isSelected
                    ? "bg-[var(--surface-subtle)] font-semibold text-[var(--ink-primary)]"
                    : "text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]",
                )}
              >
                <span>{t(ws.labelKey, ws.defaultLabel)}</span>
                {isSelected && <span className="text-emerald-500">✓</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
