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
  /** Lets a table reuse this authorized entry point inside its common action menu. */
  renderAction?: (action: { label: string; onSelect: () => void }) => ReactElement;
}

/**
 * Entry point to the explanation screen from the Host's submissions and the Examiner's marking page. Showing it is
 * only a convenience: the backend still decides whether the caller may read the attempt.
 */
export const ScoreExplanationLink = ({
  role,
  sessionPublicId,
  attemptPublicId,
  renderAction,
}: ScoreExplanationLinkProps): ReactElement => {
  const { messages: M } = useScoreExplanationText();
  const router = useRouter();
  const onSelect = (): void =>
    router.push(scoreExplanationHref(role, sessionPublicId, attemptPublicId));

  if (renderAction) return renderAction({ label: M.openLink, onSelect });

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="whitespace-nowrap"
      onClick={onSelect}
    >
      {M.openLink}
    </Button>
  );
};
