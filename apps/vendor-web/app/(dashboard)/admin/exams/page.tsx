import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { ExamBuilderForm } from "@/features/examoperations/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function ExamsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <ExamBuilderForm />
    </DashboardChrome>
  );
}
