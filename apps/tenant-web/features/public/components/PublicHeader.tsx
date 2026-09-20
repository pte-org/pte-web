"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, useSessionManager } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";

const LINK_BUTTON_CLASS =
  "inline-flex min-h-10 items-center justify-center rounded-lg px-3.5 text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2";

export const PublicHeader = (): ReactElement => {
  const { isReady, session } = useSessionManager();
  const showDashboard = isReady && Boolean(session?.accessToken);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="PTE Prep home">
          <Image
            src="/logo.png"
            alt="PTE Prep logo"
            width={40}
            height={40}
            priority
            className="h-9 w-9 rounded-lg object-contain"
          />
          <span className="text-base font-bold tracking-[-0.025em] text-[#174a86]">PTE Prep</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link
            href="/#value"
            className={`${LINK_BUTTON_CLASS} text-slate-600 hover:bg-[#f2f6fa] hover:text-action`}
          >
            Why PTE Prep
          </Link>
          <Link
            href="/#workflow"
            className={`${LINK_BUTTON_CLASS} text-slate-600 hover:bg-[#f2f6fa] hover:text-action`}
          >
            How it works
          </Link>
          <Link
            href="/#plans"
            className={`${LINK_BUTTON_CLASS} text-slate-600 hover:bg-[#f2f6fa] hover:text-action`}
          >
            Plans
          </Link>
          {showDashboard ? (
            <Link
              href={AUTH_ROUTES.hostDashboard}
              className={`${LINK_BUTTON_CLASS} ml-2 gap-1.5 bg-action px-4 text-white hover:bg-action-hover`}
            >
              Open dashboard
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href={AUTH_ROUTES.login}
                className={`${LINK_BUTTON_CLASS} ml-2 text-action hover:bg-action-tint`}
              >
                Sign in
              </Link>
              <Link
                href={AUTH_ROUTES.register}
                className={`${LINK_BUTTON_CLASS} bg-action px-4 text-white hover:bg-action-hover`}
              >
                Register organization
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {!showDashboard && (
            <Link
              href={AUTH_ROUTES.login}
              className="inline-flex min-h-10 items-center justify-center rounded-lg px-2 text-sm font-medium text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          )}
          <Link
            href={showDashboard ? AUTH_ROUTES.hostDashboard : AUTH_ROUTES.register}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-action px-3 text-xs font-semibold text-white hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
          >
            {showDashboard ? "Dashboard" : "Register"}
          </Link>
        </div>
      </div>
    </header>
  );
};
