import type { ReactElement } from "react";
import { ScoreExplanationView } from "@/features/scoreexplanation/components";
import { SCORE_EXPLANATION_PATHS } from "@/features/scoreexplanation/constants";

interface PageProps {
  params: Promise<{ sessionPublicId: string; attemptPublicId: string }>;
}

export default async function ExaminerScoreExplanationPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { sessionPublicId, attemptPublicId } = await params;
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <ScoreExplanationView
        attemptPublicId={attemptPublicId}
        sessionPublicId={sessionPublicId}
        backHref={SCORE_EXPLANATION_PATHS.examinerBack(sessionPublicId, attemptPublicId)}
      />
    </div>
  );
}
