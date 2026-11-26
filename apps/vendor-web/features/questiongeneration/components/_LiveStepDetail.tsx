import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import type { QuestionGenerationCheckStep, QuestionGenerationLiveItem } from "@pte/api-client";
import type { AssemblyText } from "../assemblyConstants";
import { CHECK_COPY, detailValue } from "../liveCheckCopy";
import { DRAFT_FIELD_LABELS, LANE_LABELS, REVIEW_CHECK_LABELS } from "../liveConstants";
import { humanizeKey } from "../utils/draftFields";
import type { LiveStep, StepId } from "../utils/liveSteps";
import type { ReviewSummary } from "../utils/reviewSummary";

export interface StepDetailProps {
  step: LiveStep;
  live: QuestionGenerationLiveItem | undefined;
  review: ReviewSummary;
  locale: "vi" | "en";
  text: AssemblyText;
  /** Labels of the pieces already on the exam screen. */
  placedLabels: string[];
  saved: { href: string; label: string } | null;
  /** The media is a chart or picture (else audio). */
  imageMedia: boolean;
  onClose?: () => void;
}

/** The checks of the live feed each step reports, in the order they run. */
const STEP_CHECKS: Partial<Record<StepId, readonly QuestionGenerationCheckStep[]>> = {
  prompt: ["PROMPT"],
  write: ["WRITE"],
  validate: ["JSON", "RULES", "DUPLICATE"],
  review: ["REVIEW_PROMPT", "REVIEW_WRITE", "REVIEW_VERDICT"],
};

type Row = [label: string, value: ReactNode];

function rowsOf({
  step,
  live,
  review,
  locale,
  text,
  placedLabels,
  saved,
  imageMedia,
}: StepDetailProps): Row[] {
  const copy = CHECK_COPY[locale];
  const steps = STEP_CHECKS[step.id];
  if (step.id === "review") {
    const labels = REVIEW_CHECK_LABELS[locale];
    const criteria: Row[] = review.checks.map((check) => [
      labels[check.key] ?? humanizeKey(check.key),
      <span key={check.key} className={check.ok === false ? "text-rose-700" : "text-emerald-700"}>
        {check.ok === null ? text.checking : check.ok ? "✓" : "✕"} {check.note}
      </span>,
    ]);
    return review.fixSuggestion ? [...criteria, [text.verdictFix, review.fixSuggestion]] : criteria;
  }
  if (steps) {
    const label = (key: string): string =>
      copy.details[key] ?? DRAFT_FIELD_LABELS[locale][key] ?? humanizeKey(key);
    return (live?.checks ?? [])
      .filter((check) => steps.includes(check.step))
      .flatMap((check): Row[] => [
        [
          copy.steps[check.step],
          check.status === "PASSED" ? "✓" : check.status === "FAILED" ? "✕" : text.checking,
        ],
        ...(check.details ?? []).map((detail): Row => [
          label(detail.key),
          detailValue(detail, copy),
        ]),
      ]);
  }
  if (step.id === "media") {
    const lane = imageMedia ? LANE_LABELS[locale].IMAGE : LANE_LABELS[locale].AUDIO;
    return [[lane, step.status === "done" ? "✓" : text.checking]];
  }
  if (step.id === "assemble") return [[text.placedPieces, placedLabels.join(", ") || "—"]];
  return saved
    ? [
        [
          text.stepSave,
          <Link key="open" className="text-[var(--action)] underline" href={saved.href}>
            {saved.label}
          </Link>,
        ],
      ]
    : [];
}

/** What one step did, opened from the step bar: its checks and their findings, the reviewer's criteria, or the save. */
export const LiveStepDetail = (props: StepDetailProps): ReactElement => {
  const { step, text, onClose } = props;
  const rows = step.status === "waiting" ? [] : rowsOf(props);
  return (
    <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-4 py-3 text-[13px]">
      <div className="mb-2 flex items-center gap-2">
        {step.status === "waiting" && (
          <span className="text-[var(--ink-muted)]">{text.notReached}</span>
        )}
        {step.flagged && <span className="text-orange-700">⚑ {text.sentBack}</span>}
        <button type="button" onClick={onClose} className="ml-auto text-xs text-[var(--action)]">
          {text.closeDetail} ✕
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1">
        {rows.map(([label, value], index) => (
          <div key={index} className="contents">
            <dt className="text-[var(--ink-muted)]">{label}</dt>
            <dd className="m-0 min-w-0 truncate">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
