import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { ExamsListView } from "@/features/exams/components";
import { HOST_NAV } from "@/lib/navigation";

export default function ExamsPage() {
  return (
    <DashboardChrome navItems={HOST_NAV} allowedRoles={HOST_ROLES}>
      <ExamsListView />
    </DashboardChrome>
  );
}
