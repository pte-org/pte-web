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
const DISCLAIMER = "PTE mock exam platform. Not affiliated with Pearson.";

const HEADER_TEXT = {
  ACCOUNT: "Account",
  LOGOUT: "Log out",
} as const;

const SidebarBrand = (): ReactElement => {
  const { t } = useLocale();
  return <Link
    href="/"
    aria-label={`${BRAND_NAME} home`}
    className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
  >
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
      <p className="text-xs text-[var(--ink-muted)]">{t("brand.schoolSubtitle", BRAND_SUBTITLE)}</p>
    </div>
  </Link>
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
  "/host/programs": (pathname) =>
    pathname.includes("/classes/") || pathname.endsWith("/classes"),
};

const HOST_NAV_ACTIVATES: Readonly<Record<string, (pathname: string) => boolean>> = {
  // The Classes section owns the class-detail page even though the URL
  // sits under `/host/programs/.../classes/...`. Force Classes active
  // whenever we navigate into a class.
  "/host/classes": (pathname) =>
    pathname.includes("/classes/") || pathname.endsWith("/classes"),
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
                ? "bg-[var(--action)] font-medium text-white shadow-[0px_4px_10px_rgba(11,95,174,0.25)]"
                : "text-[var(--ink-secondary)] hover:bg-[var(--brand-tint)] hover:text-[var(--brand-ink)]",
            )}
          >
            {item.icon && <span className="[&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>}
            {item.labelKey ? t(item.labelKey, item.label) : item.label}
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
      headerBrand={<span className="text-lg font-bold text-[var(--brand-ink)]">{BRAND_NAME}</span>}
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
