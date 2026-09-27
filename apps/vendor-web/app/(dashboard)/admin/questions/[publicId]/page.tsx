import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { QuestionDetailView } from "@/features/questionbank/components";
import { ADMIN_NAV } from "@/lib/navigation";

interface QuestionDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { publicId } = await params;

  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <QuestionDetailView publicId={publicId} />
    </DashboardChrome>
  );
}
