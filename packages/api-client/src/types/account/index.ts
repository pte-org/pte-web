import type { Role } from "../auth";

export interface CurrentUser {
  id: number | string;
  name: string;
  credential: string;
  role: Role;
  userType: string;
  tenantId: number | null;
  mustChangePassword: boolean;
}
