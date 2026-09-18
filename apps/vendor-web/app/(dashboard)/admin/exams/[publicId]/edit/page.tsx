import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { ExamBuilderForm } from "@/features/examoperations/components";
import { ADMIN_NAV } from "@/lib/navigation";

interface EditExamPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function EditExamPage({ params }: EditExamPageProps) {
  const { publicId } = await params;
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <ExamBuilderForm publicId={publicId} />
    </DashboardChrome>
  );
}
