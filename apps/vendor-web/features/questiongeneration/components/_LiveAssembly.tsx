"use client";

import { useMemo, useRef, type ReactElement, type ReactNode } from "react";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { ASSEMBLY_TEXT } from "../assemblyConstants";
import { LANE_LABELS } from "../liveConstants";
import { useDropQueue } from "../hooks/useDropQueue";
import { activePiece, livePieces } from "../utils/livePieces";
import { AgentCursor } from "./_AgentCursor";
import { FlyingPiece } from "./_FlyingPiece";
import { LiveAssemblyForm } from "./_LiveAssemblyForm";
import { LiveExamPreview } from "./_LiveExamPreview";

interface LiveAssemblyProps {
  live: QuestionGenerationLiveItem | undefined;
  /** The writer's draft as typed so far. */
  typed: unknown;
  taskType: string;
  needsAudio: boolean;
  needsImage: boolean;
  locale: "vi" | "en";
  stageLabel: string;
  /** The step-by-step log of the agents, kept below the form for whoever wants the detail. */
  steps: ReactNode;
}

const SNIPPET_CHARS = 80;

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
  steps,
}: LiveAssemblyProps): ReactElement => {
  const text = ASSEMBLY_TEXT[locale];
  const laneLabels = LANE_LABELS[locale];
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: questionTypes = [] } = useQuestionTypes(false);
  const questionType = questionTypes.find(
    (type) => type.code === taskType || type.taskTypeKey === taskType,
  );
  const pieces = useMemo(
    () =>
      livePieces(typed, live, {
        prompt: questionType?.requiresPromptText ?? true,
        options: questionType?.requiresOptions ?? false,
        audio: needsAudio,
        image: needsImage,
      }),
    [typed, live, questionType, needsAudio, needsImage],
  );
  const ready = pieces
    .filter((piece) => piece.studentFacing && piece.ready)
    .map((piece) => piece.key);
  const drops = useDropQueue(ready);
  const active = activePiece(pieces, live, typed);
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

  return (
    <div ref={rootRef} className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
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
        />
        <details className="rounded-lg border border-[var(--border-subtle)] p-3">
          <summary className="cursor-pointer text-sm font-medium text-[var(--ink-muted)]">
            {text.stepsToggle}
          </summary>
          <div className="mt-3">{steps}</div>
        </details>
      </div>
      <div className="xl:sticky xl:top-4">
        <LiveExamPreview taskType={taskType} live={live} typed={typed} placed={drops.placed} />
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
