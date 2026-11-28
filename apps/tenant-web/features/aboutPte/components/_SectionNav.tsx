"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ABOUT_PTE_LAYOUT, ABOUT_PTE_HERO_ID } from "../constants/aboutPteLayout";
import { usePastElement } from "../hooks/usePastElement";
import { useActiveSection } from "../hooks/useActiveSection";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";

/**
 * Quick-jump bar. The site header scrolls away on this page, so this is the only bar that stays pinned: it
 * highlights the section being read, and offers the score lab once the hero's own buttons are out of sight.
 */
export const SectionNav = (): ReactElement => {
  const { nav } = useAboutPteExtras();
  const active = useActiveSection(nav.items.map((item) => item.id));
  const pastHero = usePastElement(ABOUT_PTE_HERO_ID);
  return (
    <nav
      aria-label={nav.label}
      className="sticky top-0 z-40 border-b border-[var(--home-border)] bg-white/95 backdrop-blur"
    >
      <div className={`${ABOUT_PTE_LAYOUT.container} flex items-center gap-3 py-2`}>
        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.items.map((item) => (
            <li key={item.id} className="shrink-0">
              <Link
                href={`#${item.id}`}
                aria-current={active === item.id ? "location" : undefined}
                className={`inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                  active === item.id
                    ? "bg-[var(--action-tint)] text-action"
                    : "text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--home-navy)]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {pastHero && (
          <Link
            href="#simulation"
            className="hidden min-h-9 shrink-0 items-center rounded-lg bg-action px-4 text-sm font-semibold text-white transition-colors hover:bg-action-hover sm:inline-flex"
          >
            {nav.tryLab}
          </Link>
        )}
      </div>
    </nav>
  );
};
