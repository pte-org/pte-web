"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { QuestionGenerationItemResponse, QuestionGenerationLiveItem } from "@pte/api-client";
import { STAGE_LABELS, questionDetailHref, type LiveText } from "../liveConstants";
import { useTypedText } from "../hooks/useTypedText";
import { useTypingSpeed } from "../hooks/useTypingSpeed";
import { parsePartialJson } from "../utils/partialJson";
import { reviewSummary } from "../utils/reviewSummary";
import { FIRST_GATE_RANK, gateLive, stageRank } from "../utils/stepGate";
import { useStepGate } from "../hooks/useStepGate";
import { StepGateBar } from "./_StepGateBar";
import { ReplayControls } from "./_ReplayControls";
import { LiveAssembly } from "./_LiveAssembly";

interface LiveItemPanelProps {
  live: QuestionGenerationLiveItem | undefined;
  /** The job's record of the item: its outcome and, once saved, the question. */
  record: QuestionGenerationItemResponse | undefined;
  locale: "vi" | "en";
  text: LiveText;
  needsAudio: boolean;
  needsImage: boolean;
  /** The job's task type, which names the form and the exam screen. */
  taskType: string;
  /** Told whether the replay is over: text written out, pieces on the screen and the outcome known. */
  onReplayDone?: (done: boolean) => void;
  /** Show the question as it ended at once: no typing, no step pauses, no pieces flying. */
  instant?: boolean;
}

const OUTCOME_STAGES: readonly string[] = ["SAVED", "FAILED", "CANCELLED"];

/** One question as its agents make it: the detail form they fill and the exam screen it is assembled into. */
export const LiveItemPanel = ({
  live,
  record,
  locale,
  text,
  needsAudio,
  needsImage,
  taskType,
  onReplayDone,
  instant = false,
}: LiveItemPanelProps): ReactElement => {
  const pace = useTypingSpeed();
  // "Show all" covers what has arrived so far; it is cleared once caught up, and each question starts typed again.
  const [revealAll, setRevealAll] = useState({ index: -1, on: false });
  const revealing = instant || (revealAll.on && revealAll.index === (live?.index ?? -1));
  const generatorTarget = live?.generator?.text ?? "";
  const generatorText = useTypedText(generatorTarget, pace.charsPerSecond, revealing);
  const stillTyping = live !== undefined && generatorText.length < generatorTarget.length;
  const gate = useStepGate(live);
  // The provider sends a draft in one piece, so the mapped fields and later steps arrive while the typing has barely
  // started: the screen stays on the writing step until the text is written out, then goes as far as the gate lets it.
  const rank = stillTyping ? Math.min(gate.rank, FIRST_GATE_RANK) : gate.rank;
  const shown = useMemo(() => (live ? gateLive(live, rank) : live), [live, rank]);
  const reviewerTarget = shown?.reviewer?.text ?? "";
  const reviewerText = useTypedText(reviewerTarget, pace.charsPerSecond, revealing);
  const busy = stillTyping || reviewerText.length < reviewerTarget.length;
  if (revealAll.on && !busy) setRevealAll({ index: -1, on: false });
  const held = gate.ahead && !busy && rank === gate.rank;
  const draft = useMemo(() => parsePartialJson(generatorText), [generatorText]);
  const review = useMemo(() => reviewSummary(parsePartialJson(reviewerText)), [reviewerText]);
  // The screen behind the server shows no outcome yet; otherwise a recorded outcome wins over the live stage,
  // which may lag behind the end of the job.
  const behind = live !== undefined && stageRank(live.stage) > rank;
  const recorded = record && OUTCOME_STAGES.includes(record.stage) ? record.stage : null;
  const outcome = behind ? null : recorded;
  const stage = outcome ?? shown?.stage ?? record?.stage ?? "QUEUED";
  const [dropsIdle, setDropsIdle] = useState(false);
  const replayDone = !busy && dropsIdle && outcome !== null;
  useEffect(() => onReplayDone?.(replayDone), [replayDone, onReplayDone]);
  const savedHref =
    outcome === "SAVED" && record?.questionPublicId
      ? questionDetailHref(record.questionPublicId)
      : null;
  return (
    <>
      {!instant && (
        <StepGateBar
          enabled={gate.enabled}
          onToggle={gate.setEnabled}
          heldRank={held ? rank : null}
          onContinue={gate.release}
          locale={locale}
          text={text}
          extra={
            <ReplayControls
              speed={pace.speed}
              onSpeed={pace.setSpeed}
              typing={busy}
              onRevealAll={() => setRevealAll({ index: live?.index ?? -1, on: true })}
              locale={locale}
            />
          }
        />
      )}
      <LiveAssembly
        key={live?.index ?? record?.index ?? 0}
        live={shown}
        typed={draft}
        review={review}
        taskType={taskType}
        needsAudio={needsAudio}
        needsImage={needsImage}
        locale={locale}
        stageLabel={STAGE_LABELS[locale][stage as keyof typeof STAGE_LABELS.en] ?? stage}
        saved={savedHref ? { href: savedHref, label: text.openQuestion } : null}
        outcome={outcome}
        onDropsIdle={setDropsIdle}
        instant={instant}
      />
    </>
  );
};
