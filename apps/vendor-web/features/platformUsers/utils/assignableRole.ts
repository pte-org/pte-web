import type { PlatformAssignableRole, UserResponse } from "@pte/api-client";
import { PLATFORM_ASSIGNABLE_ROLE_OPTIONS } from "../constants";

const DEFAULT_ROLE: PlatformAssignableRole = "PLATFORM_MANAGER";

/** The first assignable role the user holds; PLATFORM_ADMIN is never editable here. */
export const assignableRoleOf = (user: UserResponse | null): PlatformAssignableRole =>
  user?.roles.find((role): role is PlatformAssignableRole =>
    PLATFORM_ASSIGNABLE_ROLE_OPTIONS.some((option) => option.value === role),
  ) ?? DEFAULT_ROLE;
