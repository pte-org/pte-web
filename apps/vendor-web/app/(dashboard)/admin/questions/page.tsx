import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { QuestionBankView } from "@/features/questionbank/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function QuestionsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <QuestionBankView />
    </DashboardChrome>
  );
}
