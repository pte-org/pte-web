"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAboutPteCopy } from "@/features/aboutPte/hooks/useAboutPteCopy";
import { ABOUT_PTE_ROUTE } from "@/features/aboutPte/constants/aboutPteLayout";
import { PUBLIC_TEXT } from "../constants";
import { HOME_LAYOUT } from "../homeConstants";
import { useHomeCopy } from "../useHomeCopy";

/** Two tiers: brand and the main links with a way back to the top, then the Pearson notice and the copyright. */
export const HomeFooter = (): ReactElement => {
  const { HOME_TEXT } = useHomeCopy();
  const aboutPte = useAboutPteCopy();
  const links = [
    { href: "/#platform", label: HOME_TEXT.platform },
    { href: "/#workflow", label: HOME_TEXT.workflow },
    { href: "/#plans", label: HOME_TEXT.plans },
    { href: ABOUT_PTE_ROUTE, label: aboutPte.nav },
  ];
  return (
    <footer className="bg-[var(--home-navy)] text-white">
      <div className={`${HOME_LAYOUT.container} py-8`}>
        <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <Link
            href="/"
            aria-label={PUBLIC_TEXT.HOME_ARIA_LABEL}
            className="flex items-center gap-2 text-base font-bold tracking-tight"
          >
            {/* The mark is dark blue; turned white it stays crisp on the navy background. */}
            <Image src="/logo-ppte.png" alt="" width={28} height={28} className="brightness-0 invert" />
            {PUBLIC_TEXT.BRAND}
          </Link>
          <nav aria-label={HOME_TEXT.navigation} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
            <Link
              href="#"
              className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              {`${HOME_TEXT.backToTop} ↑`}
            </Link>
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-white/15 pt-5 text-xs text-white/60 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <p className="max-w-2xl">{HOME_TEXT.pearsonNotice}</p>
          <p className="shrink-0 text-white/70">{PUBLIC_TEXT.COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
};
