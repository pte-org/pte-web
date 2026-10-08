import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { PlatformUsersView } from "@/features/platformUsers/components";

export default function PlatformUsersPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <PlatformUsersView />
    </RequireAuth>
  );
}
