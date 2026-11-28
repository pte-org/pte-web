"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { HOME_LAYOUT } from "@/features/public/homeConstants";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";

/** Closing banner: after reading about PTE, the next step is to register a centre or sign in. */
export const AboutCta = (): ReactElement => {
  const { cta } = useAboutPteExtras();
  return (
    <section aria-labelledby="about-cta-title" className="py-14 lg:py-20">
      <div className={ABOUT_PTE_LAYOUT.container}>
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-[var(--home-navy)] px-6 py-12 text-center text-white sm:px-12">
          {/* A soft glow at the top edge lifts the card off the footer, which is the same navy. */}
          <span aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-48 w-lg -translate-x-1/2 rounded-full bg-action/40 blur-3xl" />
          <span className="relative rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{cta.badge}</span>
          <h2 id="about-cta-title" className="relative max-w-3xl text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {cta.title}
          </h2>
          <p className="relative max-w-xl text-sm leading-7 text-white/80">{cta.text}</p>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <Link href={AUTH_ROUTES.register} className={HOME_LAYOUT.primaryLink}>
              {cta.register}
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href={AUTH_ROUTES.login}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              {cta.login}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
