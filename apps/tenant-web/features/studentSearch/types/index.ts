import type { UserResponse } from "@pte/api-client";

export interface StudentSearchResult {
  student: UserResponse;
  className: string | null;
  programName: string | null;
}
