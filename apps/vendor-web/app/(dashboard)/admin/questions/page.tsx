import { DashboardChrome } from "@/features/auth/components";
import { QuestionBankView } from "@/features/questionbank/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function QuestionsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV}>
      <QuestionBankView />
    </DashboardChrome>
  );
}
