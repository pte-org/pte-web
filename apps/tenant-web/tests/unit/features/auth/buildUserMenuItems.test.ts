import { describe, expect, it, vi } from "vitest";
import type { DropdownItem } from "@pte/ui";
import { buildUserMenuItems } from "@/features/auth/utils/buildUserMenuItems";
import { AUTH_ROUTES } from "@/features/auth/constants";

const Icon = (): null => null;
const icons = { profile: Icon, changePassword: Icon, logout: Icon };
const translate = (_key: string, fallback: string): string => fallback;

const labels = (items: DropdownItem[]): string[] =>
  items.flatMap((item) => ("label" in item ? [item.label] : []));

describe("buildUserMenuItems", () => {
  it("gives a Host profile, change password and log out", () => {
    const items = buildUserMenuItems({ roles: ["HOST_ADMIN"], translate, onLogout: vi.fn(), icons });

    expect(labels(items)).toEqual(["Profile & organization", "Change password", "Log out"]);
    expect(items.find((item) => "label" in item && item.label === "Change password"))
      .toMatchObject({ href: AUTH_ROUTES.changePassword });
  });

  it("offers change password to staff without the Host profile entry", () => {
    const items = buildUserMenuItems({ roles: ["EXAMINER"], translate, onLogout: vi.fn(), icons });

    expect(labels(items)).toEqual(["Change password", "Log out"]);
  });

  it("translates labels through the given key and wires log out", () => {
    const onLogout = vi.fn();
    const items = buildUserMenuItems({ roles: undefined, translate: (key) => key, onLogout, icons });
    const logout = items.at(-1);

    expect(labels(items)).toEqual(["common.changePassword", "common.logout"]);
    if (logout && "onSelect" in logout) logout.onSelect?.();
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
