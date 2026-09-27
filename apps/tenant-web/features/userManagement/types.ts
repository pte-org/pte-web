import type { GeneratedCredentialsResponse } from "@pte/api-client";

export interface AccountDetails {
  publicId: string;
  username: string;
  email: string | null;
  fullName: string | null;
  roles: string[];
  status: string;
  mustChangePassword: boolean;
  studentCode?: string | null;
  className?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
}

export type GeneratedCredentials = GeneratedCredentialsResponse;
