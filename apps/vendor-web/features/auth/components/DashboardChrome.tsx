"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  DashboardShell,
  Dropdown,
  LocaleSwitcher,
  Skeleton,
  ThemeToggle,
  cn,
  useLocale,
  useTokenManager,
  type SessionRole,
} from "@pte/ui";
import { NotificationBellContainer } from "@/features/notifications";
import { RequireAuth } from "./RequireAuth";
import { useCurrentUser } from "../api";
import { AUTH_ROUTES } from "../constants";

export interface NavItem {
  label: string;
  labelKey?: string;
  href: string;
  icon?: ReactNode;
  section?: string;
  sectionKey?: string;
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
  ACCOUNT: "Account",
  LOGOUT: "Log out",
} as const;

const SidebarBrand = (): ReactElement => {
  const { t } = useLocale();
  return (
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
      <p className="text-sm font-semibold text-[var(--ink-primary)]">{BRAND_NAME}</p>
      <p className="text-xs text-[var(--ink-muted)]">{t("brand.adminSubtitle", BRAND_SUBTITLE)}</p>
    </div>
    </div>
  );
};

const isActive = (pathname: string | null, href: string): boolean =>
  href === "/admin" ? pathname === "/admin" : Boolean(pathname?.startsWith(href));

const SidebarNav = ({ navItems }: { navItems: NavItem[] }): ReactElement => {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { t } = useLocale();
  const visibleItems = navItems.filter(
    (item) => !item.requiredRoles || item.requiredRoles.some((role) => user?.roles.includes(role)),
  );
  return (
    <>
      {visibleItems.map((item, index) => (
        <div key={item.href} className="flex flex-col gap-1">
          {(index === 0 || item.section !== visibleItems[index - 1]?.section) && item.section && (
            <span className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)] first:pt-1">
              {item.sectionKey ? t(item.sectionKey, item.section) : item.section}
            </span>
          )}
          <Link
            href={item.href}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              isActive(pathname, item.href)
                ? "bg-[var(--brand-tint)] font-medium text-[var(--brand-ink)]"
                : "text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]",
            )}
          >
            {item.icon && <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{item.icon}</span>}
            <span>{item.labelKey ? t(item.labelKey, item.label) : item.label}</span>
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
  const { t } = useLocale();

  const logout = (): void => {
    queryClient.clear();
    clearToken();
    router.replace(AUTH_ROUTES.login);
  };

  return (
    <>
      <LocaleSwitcher />
      <ThemeToggle />
      <NotificationBellContainer />
      {isLoading ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : (
        <Dropdown
          label={user?.fullName ?? t("common.account", HEADER_TEXT.ACCOUNT)}
          trigger={<Avatar name={user?.fullName} />}
          items={[{ label: t("common.logout", HEADER_TEXT.LOGOUT), onSelect: logout }]}
        />
      )}
    </>
  );
};

const ChromeContent = ({ navItems, children }: DashboardChromeProps): ReactElement => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  return (
    <DashboardShell
      brand={<SidebarBrand />}
      sidebar={<SidebarNav navItems={navItems} />}
      headerBrand={<span className="text-lg font-medium text-[var(--brand-ink)]">{BRAND_NAME}</span>}
      headerActions={<HeaderActions />}
      navigationKey={`${pathname}?${searchParams.toString()}`}
      footer={t("common.disclaimer", DISCLAIMER)}
    >
      {children}
    </DashboardShell>
  );
};

export const DashboardChrome = (props: DashboardChromeProps): ReactElement => (
  <RequireAuth allowedRoles={props.allowedRoles}>
    <ChromeContent {...props} />
  </RequireAuth>
);
