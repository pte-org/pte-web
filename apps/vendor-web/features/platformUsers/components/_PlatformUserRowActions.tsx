"use client";

import {
  ActionMenu,
  Badge,
  BanIcon,
  CheckCircleIcon,
  LockIcon,
  PencilIcon,
  ShieldIcon,
  TrashIcon,
} from "@pte/ui";
import type { UserResponse } from "@pte/api-client";
import type { PlatformUserAction } from "../types";
import type { PlatformUserText } from "../constants";

type PlatformUserRowActionsProps = {
  user: UserResponse;
  currentUserId?: string;
  copy: PlatformUserText;
  onEditProfile: (user: UserResponse) => void;
  onEditRoles: (user: UserResponse) => void;
  onAction: (user: UserResponse, action: PlatformUserAction) => void;
};

export const PlatformUserRowActions = ({
  user,
  currentUserId,
  copy,
  onEditProfile,
  onEditRoles,
  onAction,
}: PlatformUserRowActionsProps) => {
  const isProtected = user.publicId === currentUserId || user.roles.includes("PLATFORM_ADMIN");

  if (isProtected) {
    return (
      <Badge variant="info">
        <ShieldIcon className="h-3 w-3" />
        {copy.PROTECTED}
      </Badge>
    );
  }

  return (
    <ActionMenu
      items={[
        {
          label: copy.EDIT_PROFILE,
          icon: PencilIcon,
          disabled: isProtected || user.archived,
          onSelect: () => onEditProfile(user),
        },
        {
          label: copy.EDIT_ROLES,
          icon: PencilIcon,
          disabled: isProtected || user.archived,
          onSelect: () => onEditRoles(user),
        },
        {
          label: copy.RESET_PASSWORD,
          icon: LockIcon,
          disabled: isProtected || user.archived,
          onSelect: () => onAction(user, "reset"),
        },
        { separator: true, key: "platform-user-lifecycle" },
        {
          label: user.status === "ACTIVE" ? copy.SUSPEND : copy.REACTIVATE,
          icon: user.status === "ACTIVE" ? BanIcon : CheckCircleIcon,
          danger: user.status === "ACTIVE",
          disabled: isProtected || user.archived,
          onSelect: () => onAction(user, user.status === "ACTIVE" ? "suspend" : "reactivate"),
        },
        {
          label: user.archived ? copy.RESTORE : copy.ARCHIVE,
          icon: user.archived ? CheckCircleIcon : TrashIcon,
          danger: !user.archived,
          disabled: isProtected,
          onSelect: () => onAction(user, user.archived ? "restore" : "archive"),
        },
      ]}
    />
  );
};

