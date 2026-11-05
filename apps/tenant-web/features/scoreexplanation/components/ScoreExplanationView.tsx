"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { BackButton, Button, ErrorState, LoadingState } from "@pte/ui";
import { useScoreExplanation } from "../api";
import { explanationScreenState, shouldShowNoTraceNotice } from "../explanationView";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import { AnswerTraceList } from "./_AnswerTraceList";
import { ExplanationHeader } from "./_ExplanationHeader";
import { NoTraceNotice } from "./_NoTraceNotice";
import { RubricParametersPanel } from "./_RubricParametersPanel";
import { SkillScoresPanel } from "./_SkillScoresPanel";
import { TaskTypeAverageTable } from "./_TaskTypeAverageTable";

interface ScoreExplanationViewProps {
  attemptPublicId: string;
  /** The exam in the address; an attempt of another exam is shown as not available. */
  sessionPublicId: string;
  backHref: string;
}

/**
 * Trait scores -> item scores -> task type averages -> Σ(w × avg) / Σw -> 10-90, for one attempt. Every number is
 * the API's; 403 and 404 look the same so the screen never reveals whether the attempt exists.
 */
export const ScoreExplanationView = ({
  attemptPublicId,
  sessionPublicId,
  backHref,
}: ScoreExplanationViewProps): ReactElement => {
  const { messages: M } = useScoreExplanationText();
  const query = useScoreExplanation(attemptPublicId);
  const state = explanationScreenState({
    isLoading: query.isLoading,
    error: query.error,
    data: query.data,
    expectedSessionPublicId: sessionPublicId,
  });
  const explanation = query.data;

  return (
    <div className="w-full space-y-6">
      <BackButton href={backHref} label={M.back} renderLink={(props) => <Link {...props} />} />
      {state === "loading" && <LoadingState rows={6} />}
      {state === "hidden" && <ErrorState title={M.notAvailableTitle} description={M.notAvailable} />}
      {state === "error" && (
        <ErrorState
          title={M.loadErrorTitle}
          description={M.loadError}
          action={
            <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
              {M.retry}
            </Button>
          }
        />
      )}
      {state === "ready" && explanation && (
        <>
          <ExplanationHeader explanation={explanation} />
          {shouldShowNoTraceNotice(explanation) && <NoTraceNotice />}
          <RubricParametersPanel parameters={explanation.rubricParameters} />
          <AnswerTraceList items={explanation.items} />
          <TaskTypeAverageTable averages={explanation.taskTypeAverages} />
          <SkillScoresPanel skills={explanation.skills} overall={explanation.overall} />
        </>
      )}
    </div>
  );
};
