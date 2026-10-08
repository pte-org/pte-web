import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { ScoreTemplateDetailView } from "@/features/scoretemplate/components";

interface ScoreTemplateDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ScoreTemplateDetailPage({ params }: ScoreTemplateDetailPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <ScoreTemplateDetailView publicId={publicId} />
    </RequireAuth>
  );
}
