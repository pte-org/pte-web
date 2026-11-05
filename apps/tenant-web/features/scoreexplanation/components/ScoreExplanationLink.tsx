"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@pte/ui";
import { scoreExplanationHref } from "../explanationView";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import type { ScoreExplanationRole } from "../types";

interface ScoreExplanationLinkProps {
  role: ScoreExplanationRole;
  sessionPublicId: string;
  attemptPublicId: string;
}

/**
 * Entry point to the explanation screen from the Host's submissions and the Examiner's marking page. Showing it is
 * only a convenience: the backend still decides whether the caller may read the attempt.
 */
export const ScoreExplanationLink = ({
  role,
  sessionPublicId,
  attemptPublicId,
}: ScoreExplanationLinkProps): ReactElement => {
  const { messages: M } = useScoreExplanationText();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="whitespace-nowrap"
      onClick={() => router.push(scoreExplanationHref(role, sessionPublicId, attemptPublicId))}
    >
      {M.openLink}
    </Button>
  );
};
