import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { EditQuestionView } from "@/features/questionbank/components";
import { ADMIN_NAV } from "@/lib/navigation";

interface EditQuestionPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { publicId } = await params;
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <EditQuestionView publicId={publicId} />
    </DashboardChrome>
  );
}
