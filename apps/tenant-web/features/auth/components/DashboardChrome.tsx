"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
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
  section?: string;
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
  LANGUAGE: "Language",
  NOTIFICATIONS: "Notifications",
  ACCOUNT: "Account",
  LOGOUT: "Log out",
} as const;

const SidebarBrand = (): ReactElement => (
  <Link
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
      <p className="text-sm font-semibold text-gray-900">{BRAND_NAME}</p>
      <p className="text-xs text-gray-500">{BRAND_SUBTITLE}</p>
    </div>
  </Link>
);

const isActive = (pathname: string | null, href: string): boolean =>
  href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href));

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
            <span className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 first:pt-1">
              {item.section}
            </span>
          )}
          <Link
            href={item.href}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              isActive(pathname, item.href)
                ? "bg-action font-medium text-white shadow-[0px_4px_10px_rgba(11,95,174,0.25)]"
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700",
            )}
          >
            {item.icon && <span className="[&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>}
            {item.label}
          </Link>
        </div>
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
        className="grid h-10 w-10 place-items-center rounded-md text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
      >
        <GlobeIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={HEADER_TEXT.NOTIFICATIONS}
        className="relative grid h-10 w-10 place-items-center rounded-md text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
      >
        <BellIcon className="h-5 w-5" />
        <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
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

const ChromeContent = ({ navItems, children }: DashboardChromeProps): ReactElement => (
  <DashboardShell
    brand={<SidebarBrand />}
    sidebar={<SidebarNav navItems={navItems} />}
    headerBrand={<span className="text-lg font-bold text-blue-700">{BRAND_NAME}</span>}
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
