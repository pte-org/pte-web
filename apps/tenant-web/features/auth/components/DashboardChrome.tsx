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
}

const BRAND_NAME = "PTE LMS";
const BRAND_SUBTITLE = "School Portal";
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
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-700 text-sm font-bold text-white">
      A
    </span>
    <div className="leading-tight">
      <p className="text-sm font-bold text-gray-900">{BRAND_NAME}</p>
      <p className="text-xs text-gray-400">{BRAND_SUBTITLE}</p>
    </div>
  </div>
);

const SidebarNav = ({ navItems }: { navItems: NavItem[] }): ReactElement => {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
            pathname?.startsWith(item.href)
              ? "bg-indigo-50 font-medium text-blue-700"
              : "text-gray-600 hover:bg-gray-100",
          )}
        >
          {item.icon && (
            <span className="[&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>
          )}
          {item.label}
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
        className="text-gray-400 hover:text-gray-600"
      >
        <GlobeIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={HEADER_TEXT.NOTIFICATIONS}
        className="relative text-gray-400 hover:text-gray-600"
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

const ChromeContent = ({
  navItems,
  children,
}: DashboardChromeProps): ReactElement => (
  <DashboardShell
    brand={<SidebarBrand />}
    sidebar={<SidebarNav navItems={navItems} />}
    headerBrand={
      <span className="text-lg font-bold text-blue-700">{BRAND_NAME}</span>
    }
    headerActions={<HeaderActions />}
    footer={DISCLAIMER}
  >
    {children}
  </DashboardShell>
);

export const DashboardChrome = (props: DashboardChromeProps): ReactElement => (
  <RequireAuth>
    <ChromeContent {...props} />
  </RequireAuth>
);
