"use client";

import { useEffect, useMemo, useRef, type ReactElement } from "react";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { cn } from "@pte/ui";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { ASSEMBLY_TEXT, CHART_REPLAY_MS, type AssemblyText } from "../assemblyConstants";
import { LANE_LABELS } from "../liveConstants";
import { useDropQueue } from "../hooks/useDropQueue";
import { useReplay } from "../hooks/useReplay";
import { isReviewCheck } from "../liveCheckCopy";
import { REVIEW_CHECK_LABELS } from "../liveConstants";
import { activePiece, livePieces, type ActivePiece, type PieceKey } from "../utils/livePieces";
import { liveSteps } from "../utils/liveSteps";
import { agentThinking } from "../utils/liveThinking";
import type { ReviewSummary } from "../utils/reviewSummary";
import { AgentCursor } from "./_AgentCursor";
import { FlyingPiece } from "./_FlyingPiece";
import { LiveAssemblyForm } from "./_LiveAssemblyForm";
import { LiveExamPreview } from "./_LiveExamPreview";
import { LiveStepper } from "./_LiveStepper";

interface LiveAssemblyProps {
  live: QuestionGenerationLiveItem | undefined;
  /** The writer's draft as typed so far. */
  typed: unknown;
  taskType: string;
  needsAudio: boolean;
  needsImage: boolean;
  locale: "vi" | "en";
  stageLabel: string;
  /** The reviewer's answer so far, whose criteria tick off under the piece it reads. */
  review: ReviewSummary;
  /** The saved question, once there is one. */
  saved: { href: string; label: string } | null;
  /** The item's final stage from the job (SAVED, READY, FAILED, CANCELLED), or null while it runs. */
  outcome: string | null;
  /** Told whether every ready piece is on the exam screen, with no piece waiting, flying or settling. */
  onDropsIdle?: (idle: boolean) => void;
  /** Place every ready piece at once and skip the chart replay: the question is shown as it ended. */
  instant?: boolean;
}

/** The validator's checks on a draft; its progress walks it through the written pieces. */
const VALIDATE_CHECK_COUNT = 3;
const REVIEW_CRITERIA_COUNT = Object.keys(REVIEW_CHECK_LABELS.en).length;

const SNIPPET_CHARS = 80;
const CHART_REPLAY_PIECE: ActivePiece = {
  key: "image",
  lane: "IMAGE",
  phase: "media",
  replay: true,
};
const PIECE_LABEL: Record<PieceKey, keyof AssemblyText> = {
  prompt: "promptLabel",
  visual: "visualLabel",
  options: "optionsTitle",
  audio: "audioLabel",
  image: "imageLabel",
  reference: "referenceLabel",
  transcript: "transcriptLabel",
  hintVi: "hintViLabel",
  hintEn: "hintEnLabel",
};

/**
 * One question built in front of the person: agents fill the detail form on the left, and each finished student-facing
 * piece is carried onto the exam screen on the right, so the screen is seen being assembled.
 */
export const LiveAssembly = ({
  live,
  typed,
  taskType,
  needsAudio,
  needsImage,
  locale,
  stageLabel,
  review,
  saved,
  outcome,
  onDropsIdle,
  instant = false,
}: LiveAssemblyProps): ReactElement => {
  const text = ASSEMBLY_TEXT[locale];
  const laneLabels = LANE_LABELS[locale];
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: questionTypes = [] } = useQuestionTypes(false);
  const questionType = questionTypes.find(
    (type) => type.code === taskType || type.taskTypeKey === taskType,
  );
  // An image arrives in an instant (a chart) or after a while (a picture): it is held back while the real image is
  // revealed, so it is seen being drawn before it is placed.
  const chartReplay = useReplay(
    live?.imageRef ?? null,
    needsImage && outcome === null && !instant,
    CHART_REPLAY_MS,
  );
  const shown = useMemo(
    () => (chartReplay && live ? { ...live, imageRef: null } : live),
    [chartReplay, live],
  );
  const pieces = useMemo(
    () =>
      livePieces(typed, shown, {
        prompt: questionType?.requiresPromptText ?? true,
        options: questionType?.requiresOptions ?? false,
        audio: needsAudio,
        image: needsImage,
        reference:
          (questionType?.requiresReferenceAnswer ?? false) ||
          (questionType?.requiresCorrectAnswer ?? false),
      }),
    [typed, shown, questionType, needsAudio, needsImage],
  );
  const ready = pieces
    .filter((piece) => piece.studentFacing && piece.ready)
    .map((piece) => piece.key);
  const drops = useDropQueue(ready, instant);
  useEffect(() => onDropsIdle?.(drops.idle), [drops.idle, onDropsIdle]);
  const checks = live?.checks ?? [];
  const validated = checks.filter(
    (check) => !isReviewCheck(check) && check.status !== "RUNNING",
  ).length;
  const reviewed = review.checks.filter((check) => check.ok !== null).length;
  const progress =
    live?.stage === "REVIEWING"
      ? reviewed / REVIEW_CRITERIA_COUNT
      : Math.max(0, validated - 2) / VALIDATE_CHECK_COUNT;
  // A finished item has no agent at work, even if the last live snapshot still names one.
  const active = outcome
    ? null
    : chartReplay
      ? { ...CHART_REPLAY_PIECE, mediaRef: live?.imageRef ?? null }
      : activePiece(pieces, shown, typed, progress);
  const thinking = agentThinking(live, active?.lane ?? null);
  const flyingPiece = pieces.find((piece) => piece.key === drops.flying);
  const flyingLabel = flyingPiece
    ? (flyingPiece.text || flyingPiece.items.join(" · ")).slice(0, SNIPPET_CHARS) ||
      laneLabels[flyingPiece.lane]
    : "";
  // While a piece flies, the cursor carries it; otherwise it sits on the field its agent works on.
  const cursorTarget = drops.flying
    ? "[data-flying]"
    : active
      ? `[data-piece="${active.key}"]`
      : null;

  const steps = liveSteps({
    live: shown,
    outcome,
    needsMedia: needsAudio || needsImage,
    studentPieces: pieces.filter((piece) => piece.studentFacing).length,
    placedPieces: drops.placed.size,
    flying: drops.flying !== null,
  });

  return (
    <div ref={rootRef}>
      <LiveStepper
        steps={steps}
        live={shown}
        review={review}
        locale={locale}
        text={text}
        placedLabels={[...drops.placed].map((key) => text[PIECE_LABEL[key]])}
        saved={saved}
        imageMedia={needsImage}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <div className="space-y-4">
          <LiveAssemblyForm
            pieces={pieces}
            active={active}
            drops={drops}
            taskType={questionType?.displayName ?? taskType}
            section={questionType?.section ?? ""}
            stageLabel={stageLabel}
            laneLabels={laneLabels}
            text={text}
            checks={checks}
            review={review}
            locale={locale}
            saved={saved}
            typed={typed}
            thinking={thinking}
          />
        </div>
        <div
          className={cn(
            "rounded-lg transition-shadow duration-300 xl:sticky xl:top-4",
            drops.settling && "ring-2 ring-[var(--action)]/30",
          )}
        >
          <LiveExamPreview taskType={taskType} live={shown} typed={typed} placed={drops.placed} />
        </div>
      </div>
      <AgentCursor
        rootRef={rootRef}
        target={cursorTarget}
        lane={drops.flying ? (flyingPiece?.lane ?? "GENERATOR") : (active?.lane ?? "GENERATOR")}
        label={
          laneLabels[
            drops.flying ? (flyingPiece?.lane ?? "GENERATOR") : (active?.lane ?? "GENERATOR")
          ]
        }
      />
      <FlyingPiece rootRef={rootRef} piece={drops.flying} label={flyingLabel} />
    </div>
  );
};
