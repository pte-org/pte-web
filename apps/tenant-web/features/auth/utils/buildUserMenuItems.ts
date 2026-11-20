import type { DropdownItem } from "@pte/ui";
import { AUTH_ROUTES, USER_MENU_TEXT } from "../constants";

type MenuIcon = NonNullable<Extract<DropdownItem, { label: string }>["icon"]>;

interface UserMenuOptions {
  roles: readonly string[] | undefined;
  translate: (key: string, fallback: string) => string;
  onLogout: () => void;
  icons: { profile: MenuIcon; changePassword: MenuIcon; logout: MenuIcon };
}

/** Header account menu: profile (Host only), change password (every signed-in user), then log out. */
export const buildUserMenuItems = ({ roles, translate, onLogout, icons }: UserMenuOptions): DropdownItem[] => {
  const items: DropdownItem[] = [];
  if (roles?.includes("HOST_ADMIN")) {
    items.push({
      label: translate("common.profileAndOrganization", USER_MENU_TEXT.PROFILE),
      href: AUTH_ROUTES.hostProfile,
      icon: icons.profile,
    });
  }
  items.push(
    {
      label: translate("common.changePassword", USER_MENU_TEXT.CHANGE_PASSWORD),
      href: AUTH_ROUTES.changePassword,
      icon: icons.changePassword,
    },
    { separator: true, key: "account-logout" },
    { label: translate("common.logout", USER_MENU_TEXT.LOGOUT), onSelect: onLogout, icon: icons.logout },
  );
  return items;
};
