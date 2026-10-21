"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PUBLIC_TEXT } from "../constants";
import { HOME_LAYOUT } from "../homeConstants";
import { useHomeCopy } from "../useHomeCopy";

export const HomeFooter = (): ReactElement => {
  const { HOME_TEXT } = useHomeCopy();
  return (
    <footer
      className={`${HOME_LAYOUT.container} flex flex-col items-start justify-between gap-5 py-8 sm:flex-row sm:items-center`}
    >
      <Link
        href="/"
        aria-label={PUBLIC_TEXT.HOME_ARIA_LABEL}
        className="flex items-center gap-2 text-base font-bold tracking-tight text-[var(--home-navy)]"
      >
        <Image src="/logo-ppte.png" alt="" width={28} height={28} />
        {PUBLIC_TEXT.BRAND}
      </Link>
      <p className="text-[10px] text-slate-500">{HOME_TEXT.footer}</p>
      <Link href={AUTH_ROUTES.login} className={HOME_LAYOUT.textLink}>
        {HOME_TEXT.signIn}
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
    </footer>
  );
};
