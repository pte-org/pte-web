import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { BackLink } from "@/lib/BackLink";
import { ScoreTemplateDetailView } from "@/features/scoretemplate/components";

interface ExamTemplateDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ExamTemplateDetailPage({ params }: ExamTemplateDetailPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <div className="space-y-4">
        <BackLink fallbackHref="/admin/exam-template" fallbackLabel="Back to exam templates" />
        <ScoreTemplateDetailView publicId={publicId} />
      </div>
    </RequireAuth>
  );
}
