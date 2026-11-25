import type { PlatformAssignableRole, UpdatePlatformUserProfileRequest } from "@pte/api-client";

export type CreateDraft = {
  email: string;
  fullName: string;
  role: PlatformAssignableRole;
};

export type PlatformUserProfileDraft = UpdatePlatformUserProfileRequest;

/** The profile dialog edits the profile and the single platform role together. */
export type PlatformUserEditDraft = PlatformUserProfileDraft & {
  role: PlatformAssignableRole;
};

export type PlatformUserAction = "suspend" | "reactivate" | "reset" | "archive" | "restore";
