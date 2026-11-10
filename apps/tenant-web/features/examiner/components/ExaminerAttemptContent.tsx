"use client";
import type { ReactElement } from "react";
import { Button, Disclosure, EmptyState, ErrorState, LoadingState, useLocale } from "@pte/ui";
import { AiScoreDetail } from "@/features/aiScore";
import { ExaminerMarkingToolbar } from "./ExaminerMarkingToolbar";
import { PromptRenderer, ResponseRenderer } from "./AnswerContentRenderer";
import { AiReferencePanel } from "./AiReferencePanel";
import { DecisionPanel } from "./DecisionPanel";
import { BlindMarkingNotice } from "./BlindMarkingNotice";
import { ExaminerColumn } from "./ExaminerColumn";
import { PromptMeta } from "./PromptMeta";
import { AiTraitExplanation } from "./AiTraitExplanation";
import { RubricCriteriaButton } from "./RubricCriteriaButton";
import { useAiReveal } from "../hooks/useAiReveal";
import { EXAMINER_TRAIT_TEXT } from "../traitText";
import type { ExaminerAttemptController } from "../useExaminerAttemptController";
interface ExaminerAttemptContentProps { state: ExaminerAttemptController }

/**
 * The marking screen as three side-by-side columns: the item and the Student's answer, the AI's marking, and the
 * examiner's own marking. The question list is set aside for now; the toolbar below moves between questions.
 */
export const ExaminerAttemptContent = ({ state }: ExaminerAttemptContentProps): ReactElement => {
  const { T, query, answers, currentAnswer, setPromptMedia, setResponseMedia, handleApplyAiScore, activeDraft, handleTraitChange,
    handleGapReasonChange, carriedOverIds, isStale, promptMedia, responseMedia, handleScoreChange, handleCommentChange,
    handleAcknowledgeStale, isSavingDraft } = state;
  const aiReveal = useAiReveal(currentAnswer ?? undefined, activeDraft?.traitScores);
  const { locale } = useLocale();
  const text = EXAMINER_TRAIT_TEXT[locale === "vi" ? "vi" : "en"];
  const traitLabels = Object.fromEntries((currentAnswer?.rubric?.traits ?? []).map((trait) =>
    [trait.key, locale === "vi" ? trait.displayNameVi : trait.displayNameEn]));

  if (query.isLoading) return <LoadingState variant="table" label={T.LOADING_DETAIL} />;
  if (query.isError) return <ErrorState title={T.DETAIL_ERROR} action={
    <Button type="button" variant="secondary" size="sm" onClick={() => void query.refetch()}>{T.RETRY}</Button>} />;
  if (answers.length === 0) return <EmptyState title={T.NO_ANSWERS} />;
  if (!currentAnswer) return <></>;

  return <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ExaminerColumn title={text.colPrompt} tone="prompt" action={<RubricCriteriaButton rubric={currentAnswer.rubric} />}>
        <PromptMeta prompt={currentAnswer.prompt} />
        <PromptRenderer key={`prompt-${currentAnswer.answerPublicId}`} prompt={currentAnswer.prompt}
          onMediaStateChange={setPromptMedia} onRefreshMedia={() => void query.refetch()} />
        <ResponseRenderer key={`response-${currentAnswer.answerPublicId}`} response={currentAnswer.response}
          onMediaStateChange={setResponseMedia} onRefreshMedia={() => void query.refetch()} />
      </ExaminerColumn>

      <ExaminerColumn title={text.colAi} tone="ai">
        {!aiReveal.revealed ? <BlindMarkingNotice onReveal={aiReveal.revealNow} /> : <>
          <AiReferencePanel reference={currentAnswer.aiReference}
            disabled={Boolean(currentAnswer.rubric && (!currentAnswer.aiReference?.rubricVersionPublicId
              || currentAnswer.aiReference.rubricVersionPublicId !== currentAnswer.rubric.rubricVersionPublicId))}
            readOnly={currentAnswer.myScore !== null} onApplyAiScore={handleApplyAiScore}
            detail={currentAnswer.ai ? <AiScoreDetail ai={currentAnswer.ai} /> : undefined}
            feedback={currentAnswer.ai?.feedback} traitLabels={traitLabels} />
          {currentAnswer.ai && currentAnswer.aiReference?.availability !== "AVAILABLE" && (
            <Disclosure title={T.AI_DETAILS}><AiScoreDetail ai={currentAnswer.ai} /></Disclosure>
          )}
          <AiTraitExplanation answer={currentAnswer} />
        </>}
      </ExaminerColumn>

      <ExaminerColumn title={text.colExaminer} tone="examiner">
        <DecisionPanel answer={currentAnswer} showSaveAction={false} aiRevealed={aiReveal.revealed}
          gapReasons={activeDraft?.aiGapReasons} onGapReasonChange={handleGapReasonChange}
          draftScore={activeDraft?.score ?? ""} traitScores={activeDraft?.traitScores} itemScore={activeDraft?.itemScore}
          scoreTrace={activeDraft?.scoreTrace} onTraitChange={handleTraitChange}
          draftComment={activeDraft?.comment ?? ""} draftSavedAt={activeDraft?.savedAt}
          carriedOver={carriedOverIds.has(currentAnswer.answerPublicId)} isStale={isStale}
          isMediaBroken={promptMedia === "failed" || responseMedia === "failed"}
          isMediaLoading={promptMedia === "loading" || responseMedia === "loading"} isSavingDraft={isSavingDraft}
          onScoreChange={handleScoreChange} onCommentChange={handleCommentChange} onAcknowledgeStale={handleAcknowledgeStale} />
      </ExaminerColumn>
    </div>
    <ExaminerMarkingToolbar state={state} />
  </div>;
};
