"use client";
import type { ReactElement } from "react";
import { Button, EmptyState, ErrorState, LoadingState } from "@pte/ui";
import { AiScoreDetail } from "@/features/aiScore";
import { PromptRenderer, ResponseRenderer } from "./AnswerContentRenderer";
import { QuestionNavigator } from "./QuestionNavigator";
import { AiReferencePanel } from "./AiReferencePanel";
import { DecisionPanel } from "./DecisionPanel";
import type { ExaminerAttemptController } from "../useExaminerAttemptController";
export function ExaminerAttemptContent({ state }: { state: ExaminerAttemptController }): ReactElement {
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
          <div className="lg:col-span-1 xl:col-span-1">
            <QuestionNavigator
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

          <div className="space-y-4 lg:col-span-3 xl:col-span-4">
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
            />
            {currentAnswer.ai && <AiScoreDetail ai={currentAnswer.ai} />}
            <DecisionPanel
              answer={currentAnswer}
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
          </div>
        </div>
      ) : null}

  </>;
}
