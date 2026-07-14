import { DashboardChrome } from "@/features/auth/components";
import { ExamBuilderForm } from "@/features/examoperations/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function ExamsPage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV}>
      <ExamBuilderForm />
    </DashboardChrome>
  );
}
