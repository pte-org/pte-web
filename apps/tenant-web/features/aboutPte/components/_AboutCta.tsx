"use client";

import type { ReactElement } from "react";
import Link from "next/link";
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
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-[var(--home-navy)] px-6 py-12 text-center text-white sm:px-12">
          <h2 id="about-cta-title" className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            {cta.title}
          </h2>
          <p className="max-w-xl text-sm leading-7 text-white/80">{cta.text}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={AUTH_ROUTES.register} className={HOME_LAYOUT.primaryLink}>
              {cta.register}
            </Link>
            <Link
              href={AUTH_ROUTES.login}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {cta.login}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
