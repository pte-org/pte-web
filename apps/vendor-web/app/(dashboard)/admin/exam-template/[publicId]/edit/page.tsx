import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { ScoreTemplateEditorView } from "@/features/scoretemplate/components";
import { ADMIN_NAV } from "@/lib/navigation";

interface ExamTemplateEditPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ExamTemplateEditPage({ params }: ExamTemplateEditPageProps) {
  const { publicId } = await params;

  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <ScoreTemplateEditorView publicId={publicId} />
    </DashboardChrome>
  );
}
