import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { ScoreTemplateEditorView } from "@/features/scoretemplate/components";

interface ExamTemplateEditPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ExamTemplateEditPage({ params }: ExamTemplateEditPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <ScoreTemplateEditorView publicId={publicId} />
    </RequireAuth>
  );
}
