import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { ChatUsageView } from "@/features/chatUsage/components";

export default function ChatUsagePage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}>
      <ChatUsageView />
    </RequireAuth>
  );
}
