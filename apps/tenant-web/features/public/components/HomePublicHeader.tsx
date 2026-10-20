"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, LocaleSwitcher, useSessionManager } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PUBLIC_TEXT } from "../constants";
import { HOME_LAYOUT } from "../homeConstants";
import { useHomeCopy } from "../useHomeCopy";

export const HomePublicHeader = (): ReactElement => {
  const { HOME_TEXT } = useHomeCopy();
  const { isReady, session } = useSessionManager();
  const authenticated = isReady && Boolean(session?.accessToken);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--home-border)] bg-white">
      <div
        className={`${HOME_LAYOUT.container} flex min-h-20 items-center justify-between gap-3 py-3 lg:min-h-[90px]`}
      >
        <Link
          href="/"
          aria-label={PUBLIC_TEXT.HOME_ARIA_LABEL}
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-[var(--home-navy)]"
        >
          <Image
            src="/logo-ppte.png"
            alt=""
            width={36}
            height={36}
            priority
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
          <span className="max-[360px]:hidden">{PUBLIC_TEXT.BRAND}</span>
        </Link>
        <nav
          aria-label={HOME_TEXT.navigation}
          className="hidden items-center gap-7 text-sm text-slate-600 lg:flex"
        >
          <Link href="/#platform" className="hover:text-action">
            {HOME_TEXT.platform}
          </Link>
          <Link href="/#workflow" className="hover:text-action">
            {HOME_TEXT.workflow}
          </Link>
          <Link href="/#plans" className="hover:text-action">
            {HOME_TEXT.plans}
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-5">
          <LocaleSwitcher />
          {!authenticated && (
            <Link
              href={AUTH_ROUTES.login}
              className="hidden text-sm font-medium text-[var(--home-navy)] hover:text-action sm:inline-flex"
            >
              {HOME_TEXT.signIn}
            </Link>
          )}
          <Link
            href={authenticated ? AUTH_ROUTES.hostDashboard : AUTH_ROUTES.register}
            className={HOME_LAYOUT.primaryLink}
          >
            {authenticated ? HOME_TEXT.dashboard : HOME_TEXT.getStarted}
            <ChevronRightIcon className="hidden h-4 w-4 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
};
