import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { AiOverviewView } from "@/features/aiadmin/components";

export default function AiOverviewPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <AiOverviewView />
    </RequireAuth>
  );
}
