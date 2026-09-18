import type { ReactElement } from "react";
import Link from "next/link";
import { GradCapIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";

const LINK_BUTTON_CLASS =
  "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2";

export const PublicHeader = (): ReactElement => (
  <header className="border-b border-slate-200 bg-white/95">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
      <Link href="/" className="flex items-center gap-2 text-blue-800" aria-label="PTE Prep home">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-blue-600 text-white shadow-sm shadow-blue-600/25">
          <GradCapIcon className="h-5 w-5" />
        </span>
        <span className="text-base font-bold tracking-tight">PTE Prep</span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
        <Link
          href="/#plans"
          className={`${LINK_BUTTON_CLASS} text-slate-600 hover:bg-blue-50 hover:text-blue-700`}
        >
          Plans
        </Link>
        <Link
          href={AUTH_ROUTES.login}
          className={`${LINK_BUTTON_CLASS} ml-2 text-action hover:bg-action-tint`}
        >
          Sign in
        </Link>
        <Link
          href={AUTH_ROUTES.register}
          className={`${LINK_BUTTON_CLASS} bg-action text-white shadow-sm shadow-action/25 hover:bg-action-hover`}
        >
          Register organization
        </Link>
      </nav>

      <Link
        href={AUTH_ROUTES.login}
        className="text-sm font-medium text-action hover:underline md:hidden"
      >
        Sign in
      </Link>
    </div>
  </header>
);
