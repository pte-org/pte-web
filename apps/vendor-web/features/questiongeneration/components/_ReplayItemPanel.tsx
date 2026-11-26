"use client";

import { useEffect, useMemo, type ReactElement } from "react";
import type { QuestionGenerationItemResponse } from "@pte/api-client";
import { cn } from "@pte/ui";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { STAGE_LABELS, questionDetailHref, type LiveText } from "../liveConstants";
import { ITEM_CHIP_TONES } from "../liveTones";
import { useReplay } from "../hooks/useReplay";
import { useTypingSpeed } from "../hooks/useTypingSpeed";
import { gateRankOf, type FrameChip, type FrameContext, type ItemScript } from "../replay";
import { ReplayAssembly } from "./_ReplayAssembly";
import { ReplayControls } from "./_ReplayControls";
import { StepGateBar } from "./_StepGateBar";

interface ReplayItemPanelProps {
  jobId: string;
  /** The job's record of the item: its outcome and, once saved, the question. */
  record: QuestionGenerationItemResponse;
  /** The steps of the question from the stream; undefined until it sent anything about it. */
  item: ItemScript | undefined;
  locale: "vi" | "en";
  text: LiveText;
  needsAudio: boolean;
  needsImage: boolean;
  /** The job's task type, which names the form and the exam screen. */
  taskType: string;
  skipFinished: boolean;
  /** Show the stage chip above the steps (a job of one question has no list row to carry it). */
  stageChip: boolean;
  /** Told whether the replay is over. */
  onReplayDone?: (done: boolean) => void;
  /** Told the chip of the question as the replay shows it, for the list row of an open question. */
  onChip?: (chip: FrameChip) => void;
}

/**
 * One question replayed from its script. The playhead and its clock live in `useReplay`; everything on this panel,
 * the step bar, the chip, the text, the pieces and the end, is read from the frame it returns.
 */
export const ReplayItemPanel = ({
  jobId,
  record,
  item,
  locale,
  text,
  needsAudio,
  needsImage,
  taskType,
  skipFinished,
  stageChip,
  onReplayDone,
  onChip,
}: ReplayItemPanelProps): ReactElement => {
  const pace = useTypingSpeed();
  const { data: questionTypes = [] } = useQuestionTypes(false);
  const questionType = questionTypes.find((type) => type.code === taskType || type.taskTypeKey === taskType);
  const context = useMemo<FrameContext>(
    () => ({
      needs: {
        prompt: questionType?.requiresPromptText ?? true,
        options: questionType?.requiresOptions ?? false,
        audio: needsAudio,
        image: needsImage,
        reference: (questionType?.requiresReferenceAnswer ?? false) || (questionType?.requiresCorrectAnswer ?? false),
      },
      needsMedia: needsAudio || needsImage,
    }),
    [questionType, needsAudio, needsImage],
  );
  const { frame, controls } = useReplay({
    jobId,
    index: record.index,
    item,
    context,
    charsPerSecond: pace.charsPerSecond,
    skipFinished,
  });
  useEffect(() => onReplayDone?.(frame.done), [frame.done, onReplayDone]);
  const { rank, stage } = frame.chip;
  useEffect(() => onChip?.({ rank, stage }), [rank, stage, onChip]);
  const stageText = STAGE_LABELS[locale][stage as keyof typeof STAGE_LABELS.en] ?? stage;
  const savedHref =
    frame.outcome === "SAVED" && record.questionPublicId ? questionDetailHref(record.questionPublicId) : null;
  const heldRank = frame.held ? gateRankOf(frame.step) : null;
  return (
    <>
      {stageChip && (
        <div className="mb-3 flex justify-end">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium",
              ITEM_CHIP_TONES[stage] ?? ITEM_CHIP_TONES.QUEUED,
            )}
          >
            {stageText}
          </span>
        </div>
      )}
      <StepGateBar
        enabled={controls.pauseEachStep}
        onToggle={controls.setPauseEachStep}
        heldRank={heldRank}
        onContinue={controls.release}
        locale={locale}
        text={text}
        extra={
          <ReplayControls
            speed={pace.speed}
            onSpeed={pace.setSpeed}
            typing={frame.typing}
            onRevealAll={controls.revealAll}
            locale={locale}
          />
        }
      />
      <ReplayAssembly
        key={record.index}
        frame={frame}
        taskType={taskType}
        taskTypeName={questionType?.displayName ?? taskType}
        section={questionType?.section ?? ""}
        needsImage={needsImage}
        locale={locale}
        stageLabel={stageText}
        saved={savedHref ? { href: savedHref, label: text.openQuestion } : null}
      />
    </>
  );
};
