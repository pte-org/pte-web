import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { BackLink } from "@/lib/BackLink";
import { ScoreTemplateEditorView } from "@/features/scoretemplate/components";

interface ExamTemplateEditPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ExamTemplateEditPage({ params }: ExamTemplateEditPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <div className="space-y-4">
        <BackLink />
        <ScoreTemplateEditorView publicId={publicId} />
      </div>
    </RequireAuth>
  );
}
