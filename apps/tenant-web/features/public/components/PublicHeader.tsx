"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSessionManager } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PUBLIC_TEXT as T } from "../constants";

const LINK_BUTTON_CLASS =
  "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2";

export const PublicHeader = (): ReactElement => {
  const { isReady, session } = useSessionManager();
  const showDashboard = isReady && Boolean(session?.accessToken);

  return (
    <header className="border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-blue-800" aria-label={T.HOME_ARIA_LABEL}>
          <Image
            src="/logo.png"
            alt={T.LOGO_ALT}
            width={40}
            height={40}
            priority
            className="h-9 w-9 rounded-md object-contain"
          />
          <span className="text-base font-bold tracking-tight">{T.BRAND}</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label={T.MAIN_NAVIGATION}>
          <Link
            href="/#plans"
            className={`${LINK_BUTTON_CLASS} hidden text-slate-600 hover:bg-blue-50 hover:text-blue-700 md:inline-flex`}
          >
            {T.PLANS}
          </Link>
          {showDashboard ? (
            <Link
              href={AUTH_ROUTES.hostDashboard}
              className={`${LINK_BUTTON_CLASS} ml-2 bg-action text-white shadow-sm shadow-action/25 hover:bg-action-hover`}
            >
              {T.DASHBOARD}
            </Link>
          ) : (
            <>
              <Link
                href={AUTH_ROUTES.login}
                className={`${LINK_BUTTON_CLASS} ml-2 hidden text-action hover:bg-action-tint md:inline-flex`}
              >
                {T.SIGN_IN}
              </Link>
              <Link
                href={AUTH_ROUTES.register}
                className={`${LINK_BUTTON_CLASS} hidden bg-action text-white shadow-sm shadow-action/25 hover:bg-action-hover md:inline-flex`}
              >
                {T.REGISTER_ORGANIZATION}
              </Link>
            </>
          )}
        </nav>

        {!showDashboard && (
          <Link
            href={AUTH_ROUTES.login}
            className="text-sm font-medium text-action hover:underline md:hidden"
          >
            {T.SIGN_IN}
          </Link>
        )}
      </div>
    </header>
  );
};
