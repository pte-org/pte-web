import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { ScoreTemplateDetailView } from "@/features/scoretemplate/components";
import { ADMIN_NAV } from "@/lib/navigation";

interface QuestionTemplateDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function QuestionTemplateDetailPage({
  params,
}: QuestionTemplateDetailPageProps) {
  const { publicId } = await params;

  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <ScoreTemplateDetailView publicId={publicId} />
    </DashboardChrome>
  );
}
