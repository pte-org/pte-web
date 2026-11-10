import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { RubricDetailView } from "@/features/scoringrubric/components";

interface ScoringRubricDetailPageProps {
  params: Promise<{ taskType: string }>;
}

export default async function ScoringRubricDetailPage({ params }: ScoringRubricDetailPageProps) {
  const { taskType } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <RubricDetailView taskType={taskType} />
    </RequireAuth>
  );
}
