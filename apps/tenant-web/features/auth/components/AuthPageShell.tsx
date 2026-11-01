"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import { AuthBrandLockup, AuthBrandShell, type AuthFooterItem } from "@pte/ui";
import { AUTH_TEXT } from "../constants";
import { AuthBrandPanel } from "./_AuthBrandPanel";

const LOGO_WIDTH = 482;
const LOGO_HEIGHT = 567;

const FOOTER_ITEMS: readonly AuthFooterItem[] = [
  { label: AUTH_TEXT.FOOTER_COPYRIGHT.replace("{year}", String(new Date().getFullYear())) },
  { label: AUTH_TEXT.FOOTER_TERMS },
  { label: AUTH_TEXT.FOOTER_PRIVACY },
  { label: AUTH_TEXT.FOOTER_SUPPORT },
];

/**
 * The sign-in page frame (artwork, animated backdrop, theme toggle, brand, footer) for the screens that sit next
 * to sign-in: forgot password and reset password.
 */
export const AuthPageShell = ({ children }: { children: ReactNode }): ReactElement => (
  <AuthBrandShell
    artwork={<AuthBrandPanel />}
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
        name={AUTH_TEXT.BRAND}
        portalLabel={AUTH_TEXT.PORTAL_LABEL}
      />
    }
    footerItems={FOOTER_ITEMS}
    footerLabel={AUTH_TEXT.FOOTER_LABEL}
  >
    {children}
  </AuthBrandShell>
);
