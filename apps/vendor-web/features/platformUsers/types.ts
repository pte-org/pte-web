import type {
  PlatformAssignableRole,
  UpdatePlatformUserProfileRequest,
} from "@pte/api-client";

export type CreateDraft = {
  email: string;
  fullName: string;
  role: PlatformAssignableRole;
};

export type PlatformUserProfileDraft = UpdatePlatformUserProfileRequest;

export type PlatformUserAction = "suspend" | "reactivate" | "reset" | "archive" | "restore";
