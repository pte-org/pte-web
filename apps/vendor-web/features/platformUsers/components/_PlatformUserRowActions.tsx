"use client";

import { useRouter } from "next/navigation";
import {
  ActionMenu,
  BanIcon,
  CheckCircleIcon,
  HistoryIcon,
  LockIcon,
  PencilIcon,
  TrashIcon,
} from "@pte/ui";
import type { UserResponse } from "@pte/api-client";
import {
  ACTOR_ID_SEARCH_PARAM,
  AUDIT_LOG_FROM_PARAM,
  AUDIT_LOG_FROM_PLATFORM_USERS,
  AUDIT_LOG_PATH,
} from "@/features/auditLog/constants";
import type { PlatformUserAction } from "../types";
import type { PlatformUserText } from "../constants";

type PlatformUserRowActionsProps = {
  user: UserResponse;
  currentUserId?: string;
  copy: PlatformUserText;
  onEditProfile: (user: UserResponse) => void;
  onAction: (user: UserResponse, action: PlatformUserAction) => void;
};

export const PlatformUserRowActions = ({
  user,
  currentUserId,
  copy,
  onEditProfile,
  onAction,
}: PlatformUserRowActionsProps) => {
  const router = useRouter();
  const isProtected = user.publicId === currentUserId || user.roles.includes("PLATFORM_ADMIN");
  // Reading someone's activity changes nothing, so it stays available on protected accounts too.
  const activityItem = {
    label: copy.VIEW_ACTIVITY,
    icon: HistoryIcon,
    onSelect: () =>
      router.push(
        `${AUDIT_LOG_PATH}?${new URLSearchParams({ [ACTOR_ID_SEARCH_PARAM]: user.publicId, [AUDIT_LOG_FROM_PARAM]: AUDIT_LOG_FROM_PLATFORM_USERS })}`,
      ),
  };

  if (isProtected) {
    // No action is available, so say that and why, instead of a status-looking badge that reads like a label.
    const reason = user.publicId === currentUserId ? copy.LOCKED_SELF : copy.LOCKED_ADMIN;
    return (
      <div className="flex items-center justify-end gap-2">
        <span
          title={reason}
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[var(--ink-muted)]"
        >
          <LockIcon className="h-3.5 w-3.5" />
          {copy.LOCKED}
        </span>
        <ActionMenu items={[activityItem]} />
      </div>
    );
  }

  return (
    <ActionMenu
      items={[
        {
          label: copy.EDIT_PROFILE,
          icon: PencilIcon,
          disabled: user.archived,
          onSelect: () => onEditProfile(user),
        },
        {
          label: copy.RESET_PASSWORD,
          icon: LockIcon,
          disabled: user.archived,
          onSelect: () => onAction(user, "reset"),
        },
        activityItem,
        { separator: true, key: "platform-user-lifecycle" },
        {
          label: user.status === "ACTIVE" ? copy.SUSPEND : copy.REACTIVATE,
          icon: user.status === "ACTIVE" ? BanIcon : CheckCircleIcon,
          danger: user.status === "ACTIVE",
          disabled: user.archived,
          onSelect: () => onAction(user, user.status === "ACTIVE" ? "suspend" : "reactivate"),
        },
        {
          label: user.archived ? copy.RESTORE : copy.ARCHIVE,
          icon: user.archived ? CheckCircleIcon : TrashIcon,
          danger: !user.archived,
          onSelect: () => onAction(user, user.archived ? "restore" : "archive"),
        },
      ]}
    />
  );
};
