"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  DashboardShell,
  Dropdown,
  GlobeIcon,
  Skeleton,
  cn,
  useTokenManager,
  type SessionRole,
} from "@pte/ui";
import { NotificationBellContainer } from "@/features/notifications";
import { RequireAuth } from "./RequireAuth";
import { useCurrentUser } from "../api";
import { AUTH_ROUTES } from "../constants";

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  section?: string;
  requiredRoles?: SessionRole[];
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

const BRAND_NAME = "PTE Prep";
const BRAND_SUBTITLE = "Admin System";
const DISCLAIMER = "PTE mock exam platform. Not affiliated with Pearson.";

const HEADER_TEXT = {
  LANGUAGE: "Language",
  ACCOUNT: "Account",
  LOGOUT: "Log out",
} as const;

const SidebarBrand = (): ReactElement => (
  <div className="flex items-center gap-2">
    <Image
      src="/logo.png"
      alt={`${BRAND_NAME} logo`}
      width={40}
      height={40}
      priority
      className="h-10 w-10 rounded-md object-contain shadow-sm"
    />
    <div className="leading-tight">
      <p className="text-sm font-semibold text-slate-900">{BRAND_NAME}</p>
      <p className="text-xs text-slate-500">{BRAND_SUBTITLE}</p>
    </div>
  </div>
);

const isActive = (pathname: string | null, href: string): boolean =>
  href === "/admin" ? pathname === "/admin" : Boolean(pathname?.startsWith(href));

const SidebarNav = ({ navItems }: { navItems: NavItem[] }): ReactElement => {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const visibleItems = navItems.filter(
    (item) => !item.requiredRoles || item.requiredRoles.some((role) => user?.roles.includes(role)),
  );
  return (
    <>
      {visibleItems.map((item, index) => (
        <div key={item.href} className="flex flex-col gap-1">
          {(index === 0 || item.section !== visibleItems[index - 1]?.section) && item.section && (
            <span className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400 first:pt-1">
              {item.section}
            </span>
          )}
          <Link
            href={item.href}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              isActive(pathname, item.href)
                ? "bg-slate-200 font-medium text-slate-950"
                : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-950",
            )}
          >
            {item.icon && <span className="[&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        </div>
      ))}
    </>
  );
};

const HeaderActions = (): ReactElement => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearToken } = useTokenManager();
  const { data: user, isLoading } = useCurrentUser();

  const logout = (): void => {
    queryClient.clear();
    clearToken();
    router.replace(AUTH_ROUTES.login);
  };

  return (
    <>
      <button
        type="button"
        aria-label={HEADER_TEXT.LANGUAGE}
        className="grid h-10 w-10 place-items-center rounded-md text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
      >
        <GlobeIcon className="h-5 w-5" />
      </button>
      <NotificationBellContainer />
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

const ChromeContent = ({ navItems, children }: DashboardChromeProps): ReactElement => (
  <DashboardShell
    brand={<SidebarBrand />}
    sidebar={<SidebarNav navItems={navItems} />}
    headerBrand={<span className="text-lg font-medium text-slate-950">{BRAND_NAME}</span>}
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
