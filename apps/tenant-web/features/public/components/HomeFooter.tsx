import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { PUBLIC_TEXT } from "../constants";
import { HOME_LAYOUT } from "../homeConstants";

export const HomeFooter = (): ReactElement => {
  return (
    <footer className="bg-[var(--home-navy)] text-white">
      <div
        className={`${HOME_LAYOUT.container} flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center`}
      >
        <Link
          href="/"
          aria-label={PUBLIC_TEXT.HOME_ARIA_LABEL}
          className="flex items-center gap-2 text-base font-bold tracking-tight"
        >
          <Image src="/logo-ppte.png" alt="" width={28} height={28} />
          {PUBLIC_TEXT.BRAND}
        </Link>
        <p className="text-xs text-white/70">{PUBLIC_TEXT.COPYRIGHT}</p>
      </div>
    </footer>
  );
};
