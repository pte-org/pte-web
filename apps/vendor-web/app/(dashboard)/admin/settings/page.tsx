import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { PlatformSettingsView } from "@/features/commercialization/components";

export default function AdminSettingsPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <PlatformSettingsView />
    </RequireAuth>
  );
}
