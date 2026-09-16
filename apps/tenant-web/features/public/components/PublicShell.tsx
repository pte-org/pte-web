import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { GradCapIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PublicHeader } from "./PublicHeader";

interface PublicShellProps {
  children: ReactNode;
}

export const PublicShell = ({ children }: PublicShellProps): ReactElement => (
  <div className="min-h-screen bg-slate-100 text-slate-900">
    <PublicHeader />
    <main>{children}</main>
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-800"
              aria-label="PTE LMS home"
            >
              <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-white shadow-sm shadow-blue-600/25">
                <GradCapIcon className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold tracking-tight">PTE LMS</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              Focused exam operations for modern organizations.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900">
              Product
            </p>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-500">
              <Link href="/#plans" className="hover:text-action hover:underline">
                Exam packages
              </Link>
              <Link href="/#plans" className="hover:text-action hover:underline">
                Student capacity
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900">
              Account
            </p>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-500">
              <Link href={AUTH_ROUTES.login} className="hover:text-action hover:underline">
                Sign in
              </Link>
              <Link href={AUTH_ROUTES.register} className="hover:text-action hover:underline">
                Register organization
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900">
              Access
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              Apply, get approved, then choose a plan.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; 2026 PTE LMS</span>
=        </div>
      </div>
    </footer>
  </div>
);
