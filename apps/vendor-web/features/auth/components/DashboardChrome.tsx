"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Breadcrumbs,
  DashboardShell,
  Dropdown,
  LocaleSwitcher,
  SidebarNav as SharedSidebarNav,
  Skeleton,
  ThemeToggle,
  cn,
  useLocale,
  useTokenManager,
  type SessionRole,
} from "@pte/ui";
import { NotificationBellContainer } from "@/features/notifications";
import { hasAnyRole, roleLabel } from "../permissions";
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
  requiredRoles?: readonly SessionRole[];
}

interface DashboardChromeProps {
  navItems: NavItem[];
  children: ReactNode;
  /**
   * Required, not defaulted — `DashboardChrome` is the shared shell for
   * BOTH `/admin/*` (platform-role-only) and `/host` (host-admin-only)
   * pages. A default would silently lock every caller to the same role
   * set instead of forcing each call site to say explicitly who's allowed.
   */
  allowedRoles: readonly SessionRole[];
}

const BRAND_NAME = "PTE Prep";
const BRAND_SUBTITLE = "Admin System";
const DISCLAIMER = "PTE mock exam platform. Not affiliated with Pearson.";

const HEADER_TEXT = {
  ACCOUNT: "Account",
  LOGOUT: "Log out",
} as const;

const SidebarBrand = ({ collapsed = false }: { collapsed?: boolean }): ReactElement => {
  const { t } = useLocale();
  return (
    <Link
      href="/"
      aria-label={`${BRAND_NAME} home`}
      className={cn(
        "flex items-center rounded-md p-1 transition-colors hover:bg-[var(--surface-subtle)]",
        collapsed ? "justify-center" : "gap-2",
      )}
    >
      <Image
        src="/logo.png"
        alt={`${BRAND_NAME} logo`}
        width={40}
        height={40}
        priority
        className="h-10 w-10 rounded-md object-contain shadow-sm"
      />
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-semibold text-[var(--ink-primary)]">{BRAND_NAME}</p>
          <p className="text-xs text-[var(--ink-muted)]">{t("brand.adminSubtitle", BRAND_SUBTITLE)}</p>
        </div>
      )}
    </Link>
  );
};

const isActive = (pathname: string | null, href: string): boolean =>
  href === "/admin" ? pathname === "/admin" : Boolean(pathname?.startsWith(href));

const SidebarNav = ({
  navItems,
  isSidebarOpen,
  onItemClick,
}: {
  navItems: NavItem[];
  isSidebarOpen: boolean;
  onItemClick?: () => void;
}): ReactElement => {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { t } = useLocale();
  const visibleItems = navItems.filter(
    (item) => !item.requiredRoles || hasAnyRole(user?.roles, item.requiredRoles),
  );

  const sidebarItems = visibleItems.map((item) => ({
    label: item.labelKey ? t(item.labelKey, item.label) : item.label,
    href: item.href,
    icon: item.icon,
    section: item.sectionKey
      ? t(item.sectionKey, item.section ?? "Pages")
      : item.section,
    isActive: isActive(pathname, item.href),
  }));

  return (
    <SharedSidebarNav
      items={sidebarItems}
      isOpen={isSidebarOpen}
      renderLink={(item, className) => (
        <Link
          href={item.href}
          onClick={onItemClick}
          aria-label={item.label}
          aria-current={item.isActive ? "page" : undefined}
          title={isSidebarOpen ? undefined : item.label}
          className={className}
        >
          {item.icon && (
            <span
              className={cn(
                "flex shrink-0 items-center justify-center [&>svg]:h-[18px] [&>svg]:w-[18px]",
                item.isActive ? "text-[var(--ink-primary)]" : "text-[var(--ink-muted)]",
              )}
            >
              {item.icon}
            </span>
          )}
          {isSidebarOpen && <span className="truncate">{item.label}</span>}
        </Link>
      )}
    />
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
          items={[
            ...(user?.roles.map((role) => ({
              label: roleLabel(role),
              disabled: true,
              onSelect: () => undefined,
            })) ?? []),
            { label: t("common.logout", HEADER_TEXT.LOGOUT), onSelect: logout },
          ]}
        />
      )}
    </>
  );
};

const ChromeContent = ({ navItems, children }: DashboardChromeProps): ReactElement => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const activeItem = navItems.find((item) => isActive(pathname, item.href));
  const breadcrumbs = activeItem ? (
    <Breadcrumbs
      dividerType="chevron"
      renderLink={(item) => (
        <Link
          href={item.href ?? "/"}
          className="flex items-center gap-1 font-medium text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink-primary)]"
        >
          {item.icon}
          {item.label}
        </Link>
      )}
      items={[
        { href: "/", label: t("nav.home", "Home") },
        ...(activeItem.href === "/"
          ? []
          : [{ href: activeItem.href, label: activeItem.labelKey ? t(activeItem.labelKey, activeItem.label) : activeItem.label }]),
      ]}
    />
  ) : null;

  return (
    <DashboardShell
      brand={({ isSidebarOpen }) => <SidebarBrand collapsed={!isSidebarOpen} />}
      sidebar={({ isSidebarOpen, onItemClick }) => (
        <SidebarNav
          navItems={navItems}
          isSidebarOpen={isSidebarOpen}
          onItemClick={onItemClick}
        />
      )}
      headerBrand={<span className="text-lg font-medium text-[var(--brand-ink)]">{BRAND_NAME}</span>}
      headerActions={<HeaderActions />}
      breadcrumbs={breadcrumbs}
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
