"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  BellIcon,
  DashboardShell,
  Dropdown,
  GlobeIcon,
  Skeleton,
  cn,
  useTokenManager,
  type SessionRole,
} from "@pte/ui";
import { RequireAuth } from "./RequireAuth";
import { useCurrentUser } from "../api";
import { AUTH_ROUTES } from "../constants";

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface DashboardChromeProps {
  navItems: NavItem[];
  children: ReactNode;
  /**
   * Required, not defaulted — `DashboardChrome` is the shared shell for
   * BOTH `/admin/*` (platform-admin-only) and `/host` (host-admin-only)
   * pages. A default would silently lock every caller to the same role
   * set instead of forcing each call site to say explicitly who's allowed.
   */
  allowedRoles: SessionRole[];
}

const BRAND_NAME = "PTE LMS";
const BRAND_SUBTITLE = "Admin System";
const DISCLAIMER =
  "PTE mock exam platform. Not affiliated with Pearson.";

const HEADER_TEXT = {
  LANGUAGE: "Language",
  NOTIFICATIONS: "Notifications",
  ACCOUNT: "Account",
  LOGOUT: "Log out",
} as const;

const SidebarBrand = (): ReactElement => (
  <div className="flex items-center gap-2">
    <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-950/30">
      A
    </span>
    <div className="leading-tight">
      <p className="text-sm font-semibold text-white">{BRAND_NAME}</p>
      <p className="text-xs text-slate-400">{BRAND_SUBTITLE}</p>
    </div>
  </div>
);

const isActive = (pathname: string | null, href: string): boolean =>
  href === "/admin"
    ? pathname === "/admin"
    : Boolean(pathname?.startsWith(href));

const SidebarNav = ({ navItems }: { navItems: NavItem[] }): ReactElement => {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200",
            isActive(pathname, item.href)
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:bg-slate-850 hover:text-slate-200",
          )}
        >
          {item.icon && (
            <span className="[&>svg]:h-5 [&>svg]:w-5 transition-transform duration-200">{item.icon}</span>
          )}
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  );
};

const HeaderActions = (): ReactElement => {
  const router = useRouter();
  const { clearToken } = useTokenManager();
  const { data: user, isLoading } = useCurrentUser();

  const logout = (): void => {
    clearToken();
    router.replace(AUTH_ROUTES.login);
  };

  return (
    <>
      <button
        type="button"
        aria-label={HEADER_TEXT.LANGUAGE}
        className="text-slate-400 hover:text-slate-650 transition-colors"
      >
        <GlobeIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={HEADER_TEXT.NOTIFICATIONS}
        className="relative text-slate-400 hover:text-slate-650 transition-colors"
      >
        <BellIcon className="h-5 w-5" />
        <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>
      {isLoading ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : (
        <Dropdown
          label={user?.fullName ?? HEADER_TEXT.ACCOUNT}
          trigger={<Avatar name={user?.fullName} />}
          items={[{ label: HEADER_TEXT.LOGOUT, onSelect: logout }]}
        />
      )}
    </>
  );
};

const ChromeContent = ({
  navItems,
  children,
}: DashboardChromeProps): ReactElement => (
  <DashboardShell
    brand={<SidebarBrand />}
    sidebar={<SidebarNav navItems={navItems} />}
    headerBrand={
      <span className="text-lg font-semibold text-blue-700">{BRAND_NAME}</span>
    }
    headerActions={<HeaderActions />}
    footer={DISCLAIMER}
  >
    {children}
  </DashboardShell>
);

export const DashboardChrome = (props: DashboardChromeProps): ReactElement => (
  <RequireAuth allowedRoles={props.allowedRoles}>
    <ChromeContent {...props} />
  </RequireAuth>
);
