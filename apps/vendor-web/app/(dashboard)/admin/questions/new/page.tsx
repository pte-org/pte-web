import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { NewQuestionView } from "@/features/questionbank/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function NewQuestionPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <NewQuestionView />
    </DashboardChrome>
  );
}
