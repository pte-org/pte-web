import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PUBLIC_TEXT as T } from "../constants";
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
              aria-label={T.HOME_ARIA_LABEL}
            >
              <Image
                src="/logo.png"
                alt={T.LOGO_ALT}
                width={36}
                height={36}
                className="h-8 w-8 rounded-md object-contain"
              />
              <span className="text-sm font-bold tracking-tight">{T.BRAND}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              {T.FOCUS_DESCRIPTION}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900">
              {T.PRODUCT}
            </p>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-500">
              <Link href="/#plans" className="hover:text-action hover:underline">
                {T.EXAM_PACKAGES}
              </Link>
              <Link href="/#plans" className="hover:text-action hover:underline">
                {T.STUDENT_CAPACITY}
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900">
              {T.ACCOUNT}
            </p>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-500">
              <Link href={AUTH_ROUTES.login} className="hover:text-action hover:underline">
                {T.SIGN_IN}
              </Link>
              <Link href={AUTH_ROUTES.register} className="hover:text-action hover:underline">
                {T.REGISTER_ORGANIZATION}
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900">
              {T.ACCESS}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              {T.ACCESS_DESCRIPTION}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{T.COPYRIGHT}</span>
        </div>
      </div>
    </footer>
  </div>
);
