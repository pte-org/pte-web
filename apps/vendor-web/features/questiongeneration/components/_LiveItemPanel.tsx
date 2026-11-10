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
import { useTypedText } from "../hooks/useTypedText";
import { laneStatus, reachedLane } from "../utils/liveItems";
import { lastTopLevelKey, parsePartialJson } from "../utils/partialJson";
import { reviewSummary } from "../utils/reviewSummary";
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
}

const OUTCOME_STAGES: readonly string[] = ["SAVED", "FAILED", "CANCELLED"];

const MediaBody = ({ lane, mediaId, text }: { lane: "AUDIO" | "IMAGE"; mediaId: string | null; text: LiveText }): ReactElement => {
  const { url } = usePromptMedia(mediaId);
  if (!mediaId) return <p className="text-sm text-[var(--ink-muted)]">{lane === "AUDIO" ? text.mediaAudio : text.mediaImage}</p>;
  if (!url) return <p className="text-sm text-[var(--ink-muted)]">…</p>;
  // eslint-disable-next-line @next/next/no-img-element -- a signed preview address, not a static asset
  return lane === "AUDIO" ? <audio controls src={url} className="w-full" /> : <img src={url} alt="" className="max-h-72 rounded-md" />;
};

/** One question as its agents make it: the writer, the reviewer, the media makers and the save, each in its own colour. */
export const LiveItemPanel = ({ live, record, locale, text, needsAudio, needsImage }: LiveItemPanelProps): ReactElement => {
  const outcome = record && OUTCOME_STAGES.includes(record.stage) ? record.stage : null;
  const generatorText = useTypedText(live?.generator?.text ?? "");
  const reviewerText = useTypedText(live?.reviewer?.text ?? "");
  const draft = useMemo(() => parsePartialJson(generatorText), [generatorText]);
  const review = useMemo(() => reviewSummary(parsePartialJson(reviewerText)), [reviewerText]);
  const reached = reachedLane(live, review.verdict === "PASS");
  const labels = LANE_LABELS[locale];
  const status = (lane: LiveLane) => laneStatus(lane, live, outcome, reached);
  const writing = (lane: LiveLane) => status(lane) === "active";
  const mediaLanes: LiveLane[] = [...(needsAudio ? ["AUDIO" as const] : []), ...(needsImage ? ["IMAGE" as const] : [])];
  const nothingYet = !live?.generator && !outcome;

  return (
    <div className="space-y-3">
      <LiveLaneCard lane="GENERATOR" label={labels.GENERATOR} status={status("GENERATOR")}
        aside={live?.generator ? text.attempt.replace("{n}", String(live.generator.attempt)) : undefined}>
        {live?.generator ? (
          <LiveDraftFields draft={draft} labels={DRAFT_FIELD_LABELS[locale]}
            writingKey={writing("GENERATOR") ? lastTopLevelKey(draft) : null} />
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">{nothingYet && outcome === null ? text.noText : text.noLiveText}</p>
        )}
      </LiveLaneCard>
      <LiveLaneCard lane="REVIEWER" label={labels.REVIEWER} status={status("REVIEWER")}
        aside={live?.reviewer ? text.attempt.replace("{n}", String(live.reviewer.attempt)) : undefined}>
        {live?.reviewer ? (
          <LiveReviewBody summary={review} labels={REVIEW_CHECK_LABELS[locale]} text={text} writing={writing("REVIEWER")} />
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">{text.noText}</p>
        )}
      </LiveLaneCard>
      {mediaLanes.map((lane) => (
        <LiveLaneCard key={lane} lane={lane} label={labels[lane]} status={status(lane)}>
          <MediaBody lane={lane as "AUDIO" | "IMAGE"} mediaId={lane === "AUDIO" ? (live?.audioRef ?? null) : (live?.imageRef ?? null)} text={text} />
        </LiveLaneCard>
      ))}
      {/* The form flow saves nothing here (the person saves from the form), so the card shows only a real outcome. */}
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
    </div>
  );
};
