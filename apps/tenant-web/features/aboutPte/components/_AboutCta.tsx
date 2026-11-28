"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { HOME_LAYOUT } from "@/features/public/homeConstants";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";

/** Closing banner: having read how PTE is scored, register a centre, or go back up and try the score lab. */
export const AboutCta = (): ReactElement => {
  const { cta } = useAboutPteExtras();
  return (
    <section aria-labelledby="about-cta-title" className="py-14 lg:py-20">
      <div className={ABOUT_PTE_LAYOUT.container}>
        <div className="flex flex-col gap-6 rounded-3xl border border-[var(--home-border)] bg-[var(--action-tint)] px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-action shadow-sm">{cta.badge}</span>
            <h2 id="about-cta-title" className="mt-3 text-balance text-2xl font-bold tracking-tight text-[var(--home-navy)] sm:text-3xl">
              {cta.title}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-secondary)]">{cta.text}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link href={AUTH_ROUTES.register} className={HOME_LAYOUT.primaryLink}>
              {cta.register}
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="#simulation"
              className="inline-flex min-h-11 items-center rounded-lg border border-action/30 bg-white px-5 py-3 text-sm font-semibold text-action transition-colors hover:border-action"
            >
              {cta.lab}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
