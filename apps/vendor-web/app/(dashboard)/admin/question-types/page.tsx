import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { QuestionTypeView } from "@/features/questiontemplate";
import { ADMIN_NAV } from "@/lib/navigation";

export default function QuestionTypesPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <QuestionTypeView />
    </DashboardChrome>
  );
}
