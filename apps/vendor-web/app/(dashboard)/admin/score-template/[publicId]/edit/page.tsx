import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { ScoreTemplateEditorView } from "@/features/scoretemplate/components";

interface ScoreTemplateEditPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ScoreTemplateEditPage({ params }: ScoreTemplateEditPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <ScoreTemplateEditorView publicId={publicId} />
    </RequireAuth>
  );
}
