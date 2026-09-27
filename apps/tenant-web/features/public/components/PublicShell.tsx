import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PublicHeader } from "./PublicHeader";

interface PublicShellProps {
  children: ReactNode;
}

export const PublicShell = ({ children }: PublicShellProps): ReactElement => (
  <div className="min-h-screen bg-[#f2f6fa] text-slate-900">
    <a
      href="#main-content"
      className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-action shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-action"
    >
      Skip to content
    </a>
    <PublicHeader />
    <main id="main-content">{children}</main>
    <footer className="bg-[#081f36] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr_1.2fr] lg:gap-12">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#081f36]"
              aria-label="PTE Prep home"
            >
              <Image
                src="/logo.png"
                alt="PTE Prep logo"
                width={36}
                height={36}
                className="h-8 w-8 rounded-lg bg-white object-contain p-0.5"
              />
              <span className="text-base font-bold tracking-[-0.025em]">PTE Prep</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-300">
              A clearer operating layer for organizations preparing and running PTE exams.
            </p>
          </div>

          <nav aria-label="Explore PTE Prep">
            <p className="text-xs font-semibold text-[#98d6ff]">Explore</p>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-300">
              <Link href="/#value" className="hover:text-white hover:underline">
                Why PTE Prep
              </Link>
              <Link href="/#workflow" className="hover:text-white hover:underline">
                How it works
              </Link>
              <Link href="/#plans" className="hover:text-white hover:underline">
                Access plans
              </Link>
            </div>
          </nav>

          <nav aria-label="Account links">
            <p className="text-xs font-semibold text-[#98d6ff]">Account</p>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-300">
              <Link href={AUTH_ROUTES.login} className="hover:text-white hover:underline">
                Sign in
              </Link>
              <Link href={AUTH_ROUTES.register} className="hover:text-white hover:underline">
                Register organization
              </Link>
              <Link href={AUTH_ROUTES.hostDashboard} className="hover:text-white hover:underline">
                Dashboard
              </Link>
            </div>
          </nav>

          <div>
            <p className="text-xs font-semibold text-[#98d6ff]">A good first step</p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-300">
              Apply, get approved, then choose a plan that matches your next exam cycle.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; 2026 PTE Prep</span>
          <span>Practice today. Higher tomorrow.</span>
        </div>
      </div>
    </footer>
  </div>
);
