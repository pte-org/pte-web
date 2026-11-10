"use client";
import type { ReactElement } from "react";
import { Button, Disclosure, EmptyState, ErrorState, LoadingState } from "@pte/ui";
import { ScoreExplanationLink } from "@/features/scoreexplanation/components";
import { AiScoreDetail } from "@/features/aiScore";
import { ExaminerMarkingToolbar } from "./ExaminerMarkingToolbar";
import { PromptRenderer, ResponseRenderer } from "./AnswerContentRenderer";
import { QuestionNavigator } from "./QuestionNavigator";
import { AiReferencePanel } from "./AiReferencePanel";
import { DecisionPanel } from "./DecisionPanel";
import type { ExaminerAttemptController } from "../useExaminerAttemptController";
interface ExaminerAttemptContentProps { state: ExaminerAttemptController }
export const ExaminerAttemptContent = ({ state }: ExaminerAttemptContentProps): ReactElement => {
  const { T, query, answers, currentAnswer, currentIndex, drafts, isSavingDraft, handleSelectIndex, setPromptMedia, setResponseMedia, handleApplyAiScore, activeDraft, handleTraitChange, carriedOverIds, isStale, promptMedia, responseMedia, handleScoreChange, handleCommentChange, handleSaveClick, handleAcknowledgeStale } = state;
  return <>
      {query.isLoading ? (
        <LoadingState variant="table" label={T.LOADING_DETAIL} />
      ) : query.isError ? (
        <ErrorState
          title={T.DETAIL_ERROR}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void query.refetch()}
            >
              {T.RETRY}
            </Button>
          }
        />
      ) : answers.length === 0 ? (
        <EmptyState title={T.NO_ANSWERS} />
      ) : currentAnswer ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-5">
          <div className="min-w-0 self-start lg:sticky lg:top-4 lg:col-span-1 xl:col-span-1">
            <QuestionNavigator
              disabled={isSavingDraft || state.isFinalizing}
              answers={answers}
              currentIndex={currentIndex}
              drafts={Object.fromEntries(
                Object.entries(drafts).map(([k, v]) => [
                  k,
                  {
                    score: v.score,
                    isSaved: Boolean(v.savedAt) && !v.isDirty,
                    carriedOver: carriedOverIds.has(k),
                  },
                ]),
              )}
              onSelectIndex={handleSelectIndex}
            />
          </div>

          <div className="min-w-0 space-y-4 lg:col-span-3 xl:col-span-4">
            <PromptRenderer
              key={`prompt-${currentAnswer.answerPublicId}`}
              prompt={currentAnswer.prompt}
              onMediaStateChange={setPromptMedia}
              onRefreshMedia={() => void query.refetch()}
            />
            <ResponseRenderer
              key={`response-${currentAnswer.answerPublicId}`}
              response={currentAnswer.response}
              onMediaStateChange={setResponseMedia}
              onRefreshMedia={() => void query.refetch()}
            />
            <AiReferencePanel
              reference={currentAnswer.aiReference}
              disabled={Boolean(currentAnswer.rubric && (!currentAnswer.aiReference?.rubricVersionPublicId || currentAnswer.aiReference.rubricVersionPublicId !== currentAnswer.rubric.rubricVersionPublicId))}
              readOnly={currentAnswer.myScore !== null}
              onApplyAiScore={handleApplyAiScore}
              detail={currentAnswer.ai ? <AiScoreDetail ai={currentAnswer.ai} /> : undefined}
            />
            {currentAnswer.ai && currentAnswer.aiReference?.availability !== "AVAILABLE" && (
              <Disclosure title={T.AI_DETAILS}><AiScoreDetail ai={currentAnswer.ai} /></Disclosure>
            )}
            <ScoreExplanationLink role="EXAMINER" sessionPublicId={state.sessionPublicId} attemptPublicId={state.attemptPublicId}
              renderAction={(action) => <button type="button" onClick={action.onSelect} className="text-xs text-[var(--action)] hover:underline">{action.label}</button>} />
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => state.setGuidelinesOpen(true)}>{T.GUIDELINES}</Button>
            </div>
            <DecisionPanel
              answer={currentAnswer}
              showSaveAction={false}
              draftScore={activeDraft?.score ?? ""}
              traitScores={activeDraft?.traitScores}
              itemScore={activeDraft?.itemScore}
              scoreTrace={activeDraft?.scoreTrace}
              dirty={activeDraft?.isDirty}
              onTraitChange={handleTraitChange}
              draftComment={activeDraft?.comment ?? ""}
              draftSavedAt={activeDraft?.savedAt}
              carriedOver={carriedOverIds.has(currentAnswer.answerPublicId)}
              isStale={isStale}
              isMediaBroken={promptMedia === "failed" || responseMedia === "failed"}
              isMediaLoading={promptMedia === "loading" || responseMedia === "loading"}
              isSavingDraft={isSavingDraft}
              onScoreChange={handleScoreChange}
              onCommentChange={handleCommentChange}
              onSaveDraft={() => void handleSaveClick()}
              onAcknowledgeStale={handleAcknowledgeStale}
            />
            <ExaminerMarkingToolbar state={state} />
          </div>
        </div>
      ) : null}

  </>;
};
