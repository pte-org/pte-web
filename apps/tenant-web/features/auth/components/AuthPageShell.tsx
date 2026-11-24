"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import { AuthBrandLockup, AuthBrandShell, LocaleSwitcher, type AuthFooterItem } from "@pte/ui";
import { useAuthCopy } from "../hooks/useAuthCopy";
import { AuthBrandPanel } from "./_AuthBrandPanel";

const LOGO_WIDTH = 482;
const LOGO_HEIGHT = 567;

/**
 * The sign-in page frame (artwork, animated backdrop, theme toggle, brand, footer) for the screens that sit next
 * to sign-in: forgot password and reset password.
 */
export const AuthPageShell = ({ children }: { children: ReactNode }): ReactElement => {
  const { auth: T } = useAuthCopy();
  const footerItems: readonly AuthFooterItem[] = [
    { label: T.FOOTER_COPYRIGHT.replace("{year}", String(new Date().getFullYear())) },
    { label: T.FOOTER_TERMS },
    { label: T.FOOTER_PRIVACY },
    { label: T.FOOTER_SUPPORT },
  ];

  return (
    <AuthBrandShell
      artwork={<AuthBrandPanel />}
      toolbar={<LocaleSwitcher />}
      brand={
        <AuthBrandLockup
          logo={
            <Image
              src="/logo-mark.png"
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              priority
              className="h-12 w-auto"
            />
          }
          name={T.BRAND}
          portalLabel={T.PORTAL_LABEL}
        />
      }
      footerItems={footerItems}
      footerLabel={T.FOOTER_LABEL}
    >
      {children}
    </AuthBrandShell>
  );
};
