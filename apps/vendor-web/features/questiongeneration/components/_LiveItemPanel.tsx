"use client";

import { useMemo, type ReactElement } from "react";
import Link from "next/link";
import type { QuestionGenerationItemResponse, QuestionGenerationLiveItem } from "@pte/api-client";
import { usePromptMedia } from "@/features/questionbank/hooks/usePromptMediaUrl";
import {
  DRAFT_FIELD_LABELS,
  LANE_LABELS,
  REVIEW_CHECK_LABELS,
  questionDetailHref,
  type LiveLane,
  type LiveText,
} from "../liveConstants";
import { usePacedSteps } from "../hooks/usePacedSteps";
import { useTypedText } from "../hooks/useTypedText";
import { laneStatus, reachedLane } from "../utils/liveItems";
import { lastTopLevelKey, parsePartialJson } from "../utils/partialJson";
import { reviewSummary } from "../utils/reviewSummary";
import { isReviewCheck } from "../liveCheckCopy";
import { LiveChecks } from "./_LiveChecks";
import { LiveDraftFields } from "./_LiveDraftFields";
import { LiveLaneCard } from "./_LiveLaneCard";
import { LiveReviewBody } from "./_LiveReviewBody";

interface LiveItemPanelProps {
  live: QuestionGenerationLiveItem | undefined;
  /** The job's record of the item: its outcome and, once saved, the question. */
  record: QuestionGenerationItemResponse | undefined;
  locale: "vi" | "en";
  text: LiveText;
  needsAudio: boolean;
  needsImage: boolean;
  /** Describe Image: what the job asked for; AUTO is told apart once the draft shows a chart or a picture. */
  imageKind?: string | null;
}

const hasKey = (value: unknown, key: string): boolean => typeof value === "object" && value !== null && key in value;

const OUTCOME_STAGES: readonly string[] = ["SAVED", "FAILED", "CANCELLED"];

interface MediaBodyProps {
  lane: "AUDIO" | "IMAGE";
  mediaId: string | null;
  text: LiveText;
  picture: boolean;
  failed: boolean;
}

const MediaBody = ({ lane, mediaId, text, picture, failed }: MediaBodyProps): ReactElement => {
  const { url } = usePromptMedia(mediaId);
  if (failed && !mediaId) return <p className="text-sm text-red-600 dark:text-red-300">{text.mediaFailed}</p>;
  if (!mediaId) return <p className="text-sm text-[var(--ink-muted)]">{lane === "AUDIO" ? text.mediaAudio : picture ? text.mediaPicture : text.mediaImage}</p>;
  if (!url) return <p className="text-sm text-[var(--ink-muted)]">…</p>;
  // eslint-disable-next-line @next/next/no-img-element -- a signed preview address, not a static asset
  return lane === "AUDIO" ? <audio controls src={url} className="w-full" /> : <img src={url} alt="" className="max-h-72 rounded-md" />;
};

/** One question as its agents make it: the writer, the reviewer, the media makers and the save, each in its own colour. */
export const LiveItemPanel = ({ live, record, locale, text, needsAudio, needsImage, imageKind }: LiveItemPanelProps): ReactElement => {
  const outcome = record && OUTCOME_STAGES.includes(record.stage) ? record.stage : null;
  const generatorText = useTypedText(live?.generator?.text ?? "");
  const reviewerText = useTypedText(live?.reviewer?.text ?? "");
  const draft = useMemo(() => parsePartialJson(generatorText), [generatorText]);
  const review = useMemo(() => reviewSummary(parsePartialJson(reviewerText)), [reviewerText]);
  const reached = reachedLane(live, review.verdict === "PASS");
  // The picture writer's draft has an image prompt, the chart writer's a chart type.
  const kind = imageKind === "AUTO" || !imageKind
    ? (hasKey(draft, "imagePrompt") ? "PICTURE" : hasKey(draft, "chartType") ? "CHART" : imageKind)
    : imageKind;
  const labels = {
    ...LANE_LABELS[locale],
    IMAGE: kind === "PICTURE" ? text.imageLanePicture : kind === "CHART" ? LANE_LABELS[locale].IMAGE : text.imageLaneAuto,
  };
  const mediaLanes: LiveLane[] = [...(needsAudio ? ["AUDIO" as const] : []), ...(needsImage ? ["IMAGE" as const] : [])];
  // The form flow saves nothing here (the person saves from the form), so the save step shows only a real outcome.
  const lanes: LiveLane[] = ["GENERATOR", "REVIEWER", ...mediaLanes, ...(outcome !== null ? ["SAVE" as const] : [])];
  // A question written into the form ends READY, unsaved: every step it went through is done all the same.
  const laneOutcome = record?.stage === "READY" ? "SAVED" : outcome;
  // No live state (the server restarted, or the run is older): the steps follow the stage the job recorded.
  const stageOnly: QuestionGenerationLiveItem | undefined = !live && record ? {
    index: record.index, stage: record.stage, activeAgent: null, generator: null, reviewer: null, audioRef: null,
    imageRef: null,
  } : undefined;
  const paced = usePacedSteps(lanes.map((lane) => laneStatus(lane, live ?? stageOnly, laneOutcome, reached)),
    live?.index ?? -1);
  const status = (lane: LiveLane) => paced[lanes.indexOf(lane)] ?? "waiting";
  const writing = (lane: LiveLane) => status(lane) === "active";
  const writerChecks = (live?.checks ?? []).filter((check) => !isReviewCheck(check));
  const reviewerChecks = (live?.checks ?? []).filter(isReviewCheck);
  const nothingYet = !live?.generator && !outcome;

  return (
    <ul className="ml-2.5 space-y-3 border-l border-dashed border-[var(--border-subtle)] pl-5">
      <LiveLaneCard lane="GENERATOR" label={labels.GENERATOR} status={status("GENERATOR")}
        aside={live?.generator ? text.attempt.replace("{n}", String(live.generator.attempt)) : undefined}>
        {live && (live.checks !== undefined || outcome === null) && (
          <LiveChecks checks={writerChecks} itemIndex={live.index} locale={locale}
            writtenFields={typeof draft === "object" && draft !== null && !Array.isArray(draft) ? Object.keys(draft) : []} />
        )}
        {live?.generator?.text ? (
          <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
            <LiveDraftFields draft={draft} labels={DRAFT_FIELD_LABELS[locale]}
              writingKey={writing("GENERATOR") ? lastTopLevelKey(draft) : null} />
          </div>
        ) : outcome !== null && (
          <p className="text-sm text-[var(--ink-muted)]">{nothingYet ? text.noText : text.noLiveText}</p>
        )}
      </LiveLaneCard>
      <LiveLaneCard lane="REVIEWER" label={labels.REVIEWER} status={status("REVIEWER")}
        aside={live?.reviewer ? text.attempt.replace("{n}", String(live.reviewer.attempt)) : undefined}>
        {live && reviewerChecks.length > 0 && (
          <LiveChecks checks={reviewerChecks} itemIndex={live.index} locale={locale} />
        )}
        {live?.reviewer?.text ? (
          <div className={reviewerChecks.length > 0 ? "mt-3 border-t border-[var(--border-subtle)] pt-3" : undefined}>
            <LiveReviewBody summary={review} labels={REVIEW_CHECK_LABELS[locale]} text={text} writing={writing("REVIEWER")} />
          </div>
        ) : reviewerChecks.length === 0 && (
          <p className="text-sm text-[var(--ink-muted)]">{text.noText}</p>
        )}
      </LiveLaneCard>
      {mediaLanes.map((lane) => (
        <LiveLaneCard key={lane} lane={lane} label={labels[lane]} status={status(lane)}>
          <MediaBody lane={lane as "AUDIO" | "IMAGE"} mediaId={lane === "AUDIO" ? (live?.audioRef ?? null) : (live?.imageRef ?? null)} text={text} picture={kind === "PICTURE"} failed={status(lane) === "failed"} />
        </LiveLaneCard>
      ))}
      {outcome !== null && <LiveLaneCard lane="SAVE" label={labels.SAVE} status={status("SAVE")}>
        {outcome === "SAVED" && record?.questionPublicId ? (
          <p className="text-sm">
            {text.saved}{" "}
            <Link className="font-medium underline" href={questionDetailHref(record.questionPublicId)}>{text.openQuestion}</Link>
          </p>
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">
            {outcome === "FAILED" ? text.failed : text.cancelledItem}
          </p>
        )}
      </LiveLaneCard>}
    </ul>
  );
};
