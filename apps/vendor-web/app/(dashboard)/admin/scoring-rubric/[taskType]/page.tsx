import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { BackLink } from "@/lib/BackLink";
import { RubricDetailView } from "@/features/scoringrubric/components";
import { SCORING_RUBRIC_BASE_PATH } from "@/features/scoringrubric/constants";

interface ScoringRubricDetailPageProps {
  params: Promise<{ taskType: string }>;
}

export default async function ScoringRubricDetailPage({ params }: ScoringRubricDetailPageProps) {
  const { taskType } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <div className="space-y-4">
        <BackLink fallbackHref={SCORING_RUBRIC_BASE_PATH} />
        <RubricDetailView taskType={taskType} />
      </div>
    </RequireAuth>
  );
}
