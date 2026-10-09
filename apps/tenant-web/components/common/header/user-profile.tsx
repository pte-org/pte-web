"use client";

import { ChevronDownIcon } from "@pte/ui";
import { LogoutIcon } from "@/components/common/header/icons";
import { Avatar, AvatarFallback } from "@/components/ui/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/core/dropdown";

interface UserProfileButtonProps {
  name?: string;
  email?: string;
  onLogout?: () => void;
}

export function UserProfileButton({
  name = "Account",
  email,
  onLogout,
}: UserProfileButtonProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "A";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2.5 rounded-lg border-0 p-0 outline-none focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 focus-visible:ring-offset-1">
        <Avatar size="md" className="rounded-lg">
          <AvatarFallback className="rounded-lg border border-border-secondary-alt bg-background-gray-secondary_alt">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-36 truncate text-sm leading-5 font-medium text-text-primary">
          {name}
        </span>
        <ChevronDownIcon className="text-icon-tertiary transition-transform duration-200 group-aria-expanded:-rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent placement="bottom end" className="w-70 overflow-hidden p-0 shadow-3xl">
        <DropdownMenuHeader className="flex w-full items-center gap-2 border-b border-border-secondary-alt px-4 py-3">
          <Avatar size="md">
            <AvatarFallback className="border border-border-secondary-alt bg-background-gray-secondary_alt">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-text-primary">{name}</span>
            {email && <span className="truncate text-xs text-text-tertiary">{email}</span>}
          </span>
        </DropdownMenuHeader>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onAction={onLogout}
          className="m-1.5 w-auto cursor-pointer px-3 py-2.5"
        >
          <span className="text-icon-secondary group-hover:text-text-primary">
            <LogoutIcon />
          </span>
          <span className="leading-5">Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
