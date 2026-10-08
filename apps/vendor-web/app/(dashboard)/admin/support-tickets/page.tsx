import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_OPERATIONS_ROLES } from "@/features/auth/constants";
import { AdminSupportTicketsView } from "@/features/supportTickets/components";

export default function AdminSupportTicketsPage() {
  return (
    <RequireAuth allowedRoles={PLATFORM_OPERATIONS_ROLES}>
      <AdminSupportTicketsView />
    </RequireAuth>
  );
}
