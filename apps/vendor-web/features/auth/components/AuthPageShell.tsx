"use client";

import { Suspense, type ReactElement, type ReactNode } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AuthBrandLockup, AuthBrandShell, LocaleSwitcher, type AuthFooterItem } from "@pte/ui";
import { AUTH_TEXT as RAW_AUTH_TEXT } from "../constants";
import { useAdminCopy } from "../../i18n/adminCopy";
import { AuthBrandPanel } from "./_AuthBrandPanel";

const LOGO_WIDTH = 482;
const LOGO_HEIGHT = 567;
const ROLE_PARAM = "role";
const HOST_ROLE = "host";

const PortalBrand = ({ host }: { host: boolean }): ReactElement => {
  const T = useAdminCopy(RAW_AUTH_TEXT);
  return (
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
      portalLabel={host ? T.PORTAL_HOST_LABEL : T.PORTAL_ADMIN_LABEL}
    />
  );
};

/** The sign-in page can ask for the host variant (`?role=host`); the other pages in the frame always show admin. */
const RoleAwareBrand = (): ReactElement => (
  <PortalBrand host={useSearchParams().get(ROLE_PARAM) === HOST_ROLE} />
);

/**
 * The frame (artwork, animated backdrop, theme toggle, language switch, brand, footer) shared by sign-in, forgot
 * password and reset password. It lives in a layout, so it is not mounted again when moving between them.
 */
export const AuthPageShell = ({ children }: { children: ReactNode }): ReactElement => {
  const T = useAdminCopy(RAW_AUTH_TEXT);
  const footerItems: readonly AuthFooterItem[] = [
    { label: T.FOOTER_COPYRIGHT.replace("{year}", String(new Date().getFullYear())) },
    { label: T.FOOTER_TERMS },
    { label: T.FOOTER_PRIVACY },
    { label: T.FOOTER_SUPPORT },
  ];

  return (
    <AuthBrandShell
      artwork={<AuthBrandPanel />}
      brand={
        // `useSearchParams` needs a boundary so the page can still be prerendered; the admin brand is the fallback.
        <Suspense fallback={<PortalBrand host={false} />}>
          <RoleAwareBrand />
        </Suspense>
      }
      toolbar={<LocaleSwitcher />}
      footerItems={footerItems}
      footerLabel={T.FOOTER_LABEL}
    >
      {children}
    </AuthBrandShell>
  );
};
