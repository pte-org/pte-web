import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { AdminSupportTicketsView } from "@/features/supportTickets/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function AdminSupportTicketsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <AdminSupportTicketsView />
    </DashboardChrome>
  );
}
