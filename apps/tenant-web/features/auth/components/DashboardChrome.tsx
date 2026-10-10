"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LocaleSwitcher,
  Breadcrumbs,
  DashboardBreadcrumbProvider,
  useDashboardBreadcrumbItems,
  LogoutIcon,
  SidebarNav as SharedSidebarNav,
  Skeleton,
  ThemeToggle,
  UserMenu,
  cn,
  useLocale,
  useTokenManager,
  type DropdownItem,
  type SessionRole,
} from "@pte/ui";
import CommonDashboardLayout from "@/components/common/dashboard-layout";
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
  /** If set, only rendered for a caller whose roles include at least one of these — see `buildHostNav`'s "Audit Log" entry. */
  requiredRoles?: SessionRole[];
}

interface DashboardChromeProps {
  /**
   * A resolved array, not a function/thunk — Next.js's Server/Client
   * Component boundary cannot pass a function prop from a Server Component
   * page down into this (`"use client"`) component (`Functions cannot be
   * passed directly to Client Components`), so any page whose nav depends
   * on `useOrgLabels()` must itself be a Client Component that resolves
   * `buildHostNav(labels)` before rendering `DashboardChrome`.
   */
  navItems: NavItem[];
  children: ReactNode;
  /**
   * Required, not defaulted — mirrors vendor-web's DashboardChrome. A
   * default here would silently gate every route to the same role set
   * instead of forcing each call site to say explicitly who's allowed.
   */
  allowedRoles: SessionRole[];
}

const BRAND_NAME = "PTE Prep";
const BRAND_SUBTITLE = "School Portal";

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
          <p className="text-xs text-[var(--ink-muted)]">
            {t("brand.schoolSubtitle", BRAND_SUBTITLE)}
          </p>
        </div>
      )}
    </Link>
  );
};

// Active-state rules:
// - An exact match always wins.
// - Otherwise a nav item is active when the current pathname starts with
//   its href.
// - Class detail pages live at `/host/programs/{programId}/classes/{cid}`
//   for URL continuity with the Program → Class navigation flow. Without
//   extra rules that URL would highlight the Programs nav item — even
//   though the user is conceptually looking at a Class. We resolve this
//   by deactivating `/host/programs` whenever the pathname enters the
//   `/classes/` sub-segment of a program, AND activating `/host/classes`
//   in that case. The user lands on a Class via the Classes section, so
//   Classes should be the highlighted entry point.
// - Programs list (`/host/programs`) and Programs detail
//   (`/host/programs/{id}`) still highlight normally because they have
//   no `/classes/` sub-segment.
const HOST_NAV_DEACTIVATES: Readonly<Record<string, (pathname: string) => boolean>> = {
  "/host/programs": (pathname) => pathname.includes("/classes/") || pathname.endsWith("/classes"),
};

const HOST_NAV_ACTIVATES: Readonly<Record<string, (pathname: string) => boolean>> = {
  // The Classes section owns the class-detail page even though the URL
  // sits under `/host/programs/.../classes/...`. Force Classes active
  // whenever we navigate into a class.
  "/host/classes": (pathname) => pathname.includes("/classes/") || pathname.endsWith("/classes"),
};

const isActive = (pathname: string | null, href: string): boolean => {
  if (!pathname) return false;
  const forceOn = HOST_NAV_ACTIVATES[href];
  if (forceOn && forceOn(pathname)) return true;
  if (href === "/") return pathname === "/";
  if (!pathname.startsWith(href)) return false;
  const deactivator = HOST_NAV_DEACTIVATES[href];
  if (deactivator && deactivator(pathname)) return false;
  return true;
};

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
    (item) => !item.requiredRoles || item.requiredRoles.some((role) => user?.roles.includes(role)),
  );

  const sidebarItems = visibleItems.map((item) => ({
    label: item.labelKey ? t(item.labelKey, item.label) : item.label,
    href: item.href,
    icon: item.icon,
    section: item.sectionKey ? t(item.sectionKey, item.section ?? "Pages") : item.section,
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

  const userMenuItems: DropdownItem[] = [
    {
      label: t("common.logout", HEADER_TEXT.LOGOUT),
      onSelect: logout,
      icon: LogoutIcon,
    },
  ];

  return (
    <>
      <LocaleSwitcher />
      <ThemeToggle />
      <NotificationBellContainer />
      {isLoading ? (
        <Skeleton className="h-10 w-10 rounded-lg sm:w-28" />
      ) : (
        <UserMenu
          name={user?.fullName ?? t("common.account", HEADER_TEXT.ACCOUNT)}
          email={user?.email}
          items={userMenuItems}
        />
      )}
    </>
  );
};

const ChromeContent = ({ navItems, children }: DashboardChromeProps): ReactElement => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();
  const { t } = useLocale();
  const searchItems = navItems
    .filter(
      (item) =>
        !item.requiredRoles || item.requiredRoles.some((role) => user?.roles.includes(role)),
    )
    .map((item) => ({
      id: item.href,
      title: item.labelKey ? t(item.labelKey, item.label) : item.label,
      section: item.sectionKey
        ? t(item.sectionKey, item.section ?? "Pages")
        : (item.section ?? "Pages"),
      url: item.href,
      icon: item.icon,
    }));
  const activeItem = navItems
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const breadcrumbItems = useDashboardBreadcrumbItems(
    pathname,
    activeItem
      ? {
          href: activeItem.href,
          label: activeItem.labelKey ? t(activeItem.labelKey, activeItem.label) : activeItem.label,
        }
      : undefined,
    t("common.breadcrumbDetails", "Details"),
  );
  const breadcrumbs =
    breadcrumbItems.length > 0 ? (
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
        items={breadcrumbItems}
      />
    ) : null;

  return (
    <CommonDashboardLayout
      brand={({ isSidebarOpen }) => <SidebarBrand collapsed={!isSidebarOpen} />}
      sidebar={({ isSidebarOpen, onItemClick }) => (
        <SidebarNav navItems={navItems} isSidebarOpen={isSidebarOpen} onItemClick={onItemClick} />
      )}
      headerSearchItems={searchItems}
      headerSearchPlaceholder={t("common.searchPages", "Tìm kiếm trang...")}
      onHeaderSearchNavigate={(url) => router.push(url)}
      breadcrumbs={breadcrumbs}
      headerActions={<HeaderActions />}
      navigationKey={`${pathname}?${searchParams.toString()}`}
    >
      {children}
    </CommonDashboardLayout>
  );
};

export const DashboardChrome = (props: DashboardChromeProps): ReactElement => (
  <RequireAuth allowedRoles={props.allowedRoles}>
    <DashboardBreadcrumbProvider>
      <ChromeContent {...props} />
    </DashboardBreadcrumbProvider>
  </RequireAuth>
);
