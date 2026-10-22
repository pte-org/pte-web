"use client";

import type { ReactElement, ReactNode } from "react";
import { ThemeToggle } from "../theme";
import { AuthBackdrop } from "./AuthBackdrop";

export interface AuthFooterItem {
  label: string;
  /** Rendered as plain text when absent (e.g. no published page yet). */
  href?: string;
}

export interface AuthBrandShellProps {
  /** Left panel on md+ screens, e.g. `<PteOrbitPanel />`. Hidden by the panel itself on mobile. */
  artwork: ReactNode;
  /** Pinned to the top of the form column (e.g. `<AuthBrandLockup />`); the form centres in the space left. */
  brand?: ReactNode;
  /** Extra controls rendered before the theme toggle (e.g. `<LocaleSwitcher />`). */
  toolbar?: ReactNode;
  footerItems?: readonly AuthFooterItem[];
  footerLabel?: string;
  children: ReactNode;
}

export interface AuthBrandLockupProps {
  /** App-rendered logo (next/image lives in the app, not in @pte/ui). */
  logo: ReactNode;
  name: string;
  portalLabel?: string;
}

const AuthFooter = ({
  items,
  label,
}: {
  items: readonly AuthFooterItem[];
  label?: string;
}): ReactElement => (
  <footer className="relative z-10 px-4 pb-6 pt-2">
    <nav aria-label={label}>
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[var(--ink-muted)] [&>li+li]:before:mr-3 [&>li+li]:before:content-['·']">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a href={item.href} className="hover:text-[var(--ink-primary)] hover:underline">
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  </footer>
);

/** Shared sign-in page frame for the tenant and vendor portals. */
export const AuthBrandShell = ({
  artwork,
  brand,
  toolbar,
  footerItems = [],
  footerLabel,
  children,
}: AuthBrandShellProps): ReactElement => (
  <main className="relative flex min-h-screen flex-col bg-[var(--surface-page)]">
    <AuthBackdrop />
    <div className="relative z-10 flex items-center justify-end gap-2 p-4">
      {toolbar}
      <ThemeToggle />
    </div>
    <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-4">
      <div className="grid w-full max-w-[68rem] overflow-hidden rounded-2xl border border-[var(--shell-border)] bg-[var(--surface-card)] shadow-2xl shadow-action/15 md:grid-cols-2">
        {artwork}
        <div className="flex flex-col p-8 sm:p-10 md:px-14 md:py-10">
          {brand}
          <div className="flex flex-1 flex-col justify-center gap-5 pt-8 md:pt-7">{children}</div>
        </div>
      </div>
    </div>
    {footerItems.length > 0 && <AuthFooter items={footerItems} label={footerLabel} />}
  </main>
);

/** Logo + product name + portal label, sized so the mark matches the wordmark height. */
export const AuthBrandLockup = ({
  logo,
  name,
  portalLabel,
}: AuthBrandLockupProps): ReactElement => (
  <div className="flex items-center gap-3">
    <span className="flex h-12 shrink-0 items-center">{logo}</span>
    <span className="flex flex-col">
      <span className="text-2xl font-extrabold leading-none tracking-tight text-[var(--brand-ink)]">
        {name}
      </span>
      {portalLabel && (
        <span className="mt-1.5 text-[0.6875rem] font-bold uppercase leading-none tracking-[0.12em] text-action">
          {portalLabel}
        </span>
      )}
    </span>
  </div>
);
