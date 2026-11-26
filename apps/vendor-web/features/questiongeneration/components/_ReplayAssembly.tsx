"use client";

import { useMemo, useRef, type ReactElement } from "react";
import { cn } from "@pte/ui";
import { ASSEMBLY_TEXT, type AssemblyText } from "../assemblyConstants";
import { LANE_LABELS, REVIEW_CHECK_LABELS } from "../liveConstants";
import { parseDraftText } from "../replay/partialMemo";
import type { Frame } from "../replay";
import { activePiece, type ActivePiece, type PieceKey } from "../utils/livePieces";
import { agentThinking } from "../utils/liveThinking";
import { reviewSummary } from "../utils/reviewSummary";
import { AgentCursor } from "./_AgentCursor";
import { FlyingPiece } from "./_FlyingPiece";
import { LiveAssemblyForm } from "./_LiveAssemblyForm";
import { LiveExamPreview } from "./_LiveExamPreview";
import { LiveStepper } from "./_LiveStepper";

interface ReplayAssemblyProps {
  frame: Frame;
  taskType: string;
  /** The task type's display name and section, for the form's header. */
  taskTypeName: string;
  section: string;
  needsImage: boolean;
  locale: "vi" | "en";
  stageLabel: string;
  /** The saved question, once the replay has reached the end and there is one. */
  saved: { href: string; label: string } | null;
}

/** The validator's checks on a draft; its progress walks it through the written pieces. */
const VALIDATE_CHECK_COUNT = 3;
const REVIEW_CRITERIA_COUNT = Object.keys(REVIEW_CHECK_LABELS.en).length;
const SNIPPET_CHARS = 80;
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

/** An agent's name with the model behind it, when the stream said which. */
const named = (name: string, model: string | undefined): string => (model ? `${name} · ${model}` : name);

/** The piece an agent works on at this frame: the media being drawn, or the field being written or checked. */
function activeOf(frame: Frame, typed: unknown, progress: number, needsImage: boolean): ActivePiece | null {
  if (frame.outcome) return null;
  const step = frame.step;
  // The chart is revealed over its step before it is placed, so it is seen being drawn.
  if (step?.kind === "media" && needsImage && step.imageRef && !frame.stepComplete) {
    return { key: "image", lane: "IMAGE", phase: "media", replay: true, mediaRef: step.imageRef };
  }
  return activePiece(frame.pieces, frame.view, typed, progress);
}

/**
 * One question built in front of the person, drawn from one frame of the replay: agents fill the detail form on the
 * left, and each finished student-facing piece is carried onto the exam screen on the right.
 */
export const ReplayAssembly = ({
  frame,
  taskType,
  taskTypeName,
  section,
  needsImage,
  locale,
  stageLabel,
  saved,
}: ReplayAssemblyProps): ReactElement => {
  const text = ASSEMBLY_TEXT[locale];
  const rootRef = useRef<HTMLDivElement>(null);
  const { view } = frame;
  const base = LANE_LABELS[locale];
  // The two language agents carry the name of the model that answered, which changes when a fallback takes over.
  const laneLabels = {
    ...base,
    GENERATOR: named(base.GENERATOR, view.generator?.model),
    REVIEWER: named(base.REVIEWER, view.reviewer?.model),
  };
  const typed = useMemo(() => parseDraftText(`item-${view.index}`, view.generator?.text ?? ""), [view]);
  const review = useMemo(
    () => reviewSummary(parseDraftText(`review-${view.index}`, view.reviewer?.text ?? "")),
    [view],
  );
  const checks = view.checks ?? [];
  const validated = checks.filter((check) => check.status !== "RUNNING" && !check.step.startsWith("REVIEW")).length;
  const reviewed = review.checks.filter((check) => check.ok !== null).length;
  const progress =
    view.stage === "REVIEWING"
      ? reviewed / REVIEW_CRITERIA_COUNT
      : Math.max(0, validated - 2) / VALIDATE_CHECK_COUNT;
  const active = activeOf(frame, typed, progress, needsImage);
  const thinking = agentThinking(view, active?.lane ?? null);
  const flyingPiece = frame.pieces.find((piece) => piece.key === frame.flying);
  const flyingLabel = flyingPiece
    ? (flyingPiece.text || flyingPiece.items.join(" · ")).slice(0, SNIPPET_CHARS) || laneLabels[flyingPiece.lane]
    : "";
  const cursorLane = frame.flying ? (flyingPiece?.lane ?? "GENERATOR") : (active?.lane ?? "GENERATOR");
  const cursorTarget = frame.flying ? "[data-flying]" : active ? `[data-piece="${active.key}"]` : null;
  const drops = { placed: frame.placed, flying: frame.flying, settling: frame.settling, idle: frame.done };

  return (
    <div ref={rootRef}>
      <LiveStepper
        steps={frame.steps}
        live={view}
        review={review}
        locale={locale}
        text={text}
        placedLabels={[...frame.placed].map((key) => text[PIECE_LABEL[key]])}
        saved={saved}
        imageMedia={needsImage}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <div className="space-y-4">
          <LiveAssemblyForm
            pieces={frame.pieces}
            active={active}
            drops={drops}
            taskType={taskTypeName || taskType}
            section={section}
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
            frame.settling && "ring-2 ring-[var(--action)]/30",
          )}
        >
          <LiveExamPreview taskType={taskType} live={view} typed={typed} placed={frame.placed} />
        </div>
      </div>
      <AgentCursor rootRef={rootRef} target={cursorTarget} lane={cursorLane} label={laneLabels[cursorLane]} />
      <FlyingPiece rootRef={rootRef} piece={frame.flying} label={flyingLabel} />
    </div>
  );
};
