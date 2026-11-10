import type { ReactElement } from "react";
import { ScoreExplanationView } from "@/features/scoreexplanation/components";
import { SCORE_EXPLANATION_PATHS } from "@/features/scoreexplanation/constants";

interface PageProps {
  params: Promise<{ publicId: string; attemptPublicId: string }>;
}

export default async function HostScoreExplanationPage({ params }: PageProps): Promise<ReactElement> {
  const { publicId, attemptPublicId } = await params;
  return (
    <ScoreExplanationView
      attemptPublicId={attemptPublicId}
      sessionPublicId={publicId}
      backHref={SCORE_EXPLANATION_PATHS.hostBack(publicId)}
    />
  );
}
