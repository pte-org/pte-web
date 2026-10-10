"use client";

import type { ReactElement, ReactNode } from "react";
import { Avatar } from "./Avatar";
import { ChevronDownIcon } from "./icons";
import { Dropdown, type DropdownItem } from "./Dropdown";

export interface UserMenuProps {
  name: string;
  email?: string;
  items: DropdownItem[];
  avatar?: ReactNode;
  showName?: boolean;
  label?: string;
}

export const UserMenu = ({
  name,
  email,
  items,
  avatar,
  showName = true,
  label,
}: UserMenuProps): ReactElement => {
  const displayName = name.trim() || email?.split("@")[0] || "Account";

  const profileHeader = (
    <div className="flex min-w-0 items-center gap-3 px-4 py-3">
      {avatar ?? (
        <Avatar
          name={displayName}
          className="h-10 w-10 rounded-lg bg-[var(--brand-tint)] text-[var(--brand-ink)] ring-1 ring-[var(--shell-border)]"
        />
      )}
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">{displayName}</p>
        {email && <p className="truncate text-xs text-[var(--ink-muted)]">{email}</p>}
      </div>
    </div>
  );

  return (
    <Dropdown
      items={items}
      label={label ?? displayName}
      menuHeader={profileHeader}
      menuClassName="w-72 p-0"
      triggerClassName="group h-auto w-auto rounded-lg px-1 py-1"
      trigger={
        <div className="flex items-center gap-2.5">
          {avatar ?? (
            <Avatar
              name={displayName}
              className="h-10 w-10 rounded-lg bg-[var(--brand-tint)] text-[var(--brand-ink)] ring-1 ring-[var(--shell-border)]"
            />
          )}
          {showName && (
            <span className="hidden max-w-36 truncate text-left text-sm font-medium text-[var(--ink-primary)] sm:block">
              {displayName}
            </span>
          )}
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-[var(--ink-muted)] transition-transform duration-200 group-aria-expanded:rotate-180" />
        </div>
      }
    />
  );
};
