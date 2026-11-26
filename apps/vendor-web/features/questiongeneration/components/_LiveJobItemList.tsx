"use client";

import { useCallback, useState, type ReactElement } from "react";
import type { QuestionGenerationJobResponse } from "@pte/api-client";
import { STAGE_LABELS, type LiveText } from "../liveConstants";
import type { FrameChip, Script } from "../replay";
import { ITEM_CHIP_TONES } from "../liveTones";
import { followedIndex, type LiveItems } from "../utils/liveItems";
import { itemStatus } from "../utils/stepPacing";
import { ReplayItemPanel } from "./_ReplayItemPanel";
import { PlanTaskRow } from "./_PlanTaskRow";

interface LiveJobItemListProps {
  job: QuestionGenerationJobResponse;
  items: LiveItems;
  lang: "vi" | "en";
  text: LiveText;
  needsAudio: boolean;
  needsImage: boolean;
  /** Told whether the replay of the question shown open is over. */
  onReplayDone?: (done: boolean) => void;
  jobId: string;
  /** The steps of the job's questions, in the order they ran. */
  script: Script;
  /** Show a question that has finished as it ended instead of replaying it. */
  skipFinished: boolean;
}

/** The questions of a job, each opening onto the steps its agents take; the one being made is open by default. */
export const LiveJobItemList = ({
  job,
  items,
  lang,
  text,
  needsAudio,
  needsImage,
  onReplayDone,
  jobId,
  script,
  skipFinished,
}: LiveJobItemListProps): ReactElement => {
  const [picked, setPicked] = useState<number | null>(null);
  // What the replay shows for the open question; the list row follows it, not the server.
  const [chips, setChips] = useState<Record<number, FrameChip>>({});
  const chipOf = useCallback(
    (index: number) => (chip: FrameChip): void =>
      setChips((known) => (known[index]?.stage === chip.stage ? known : { ...known, [index]: chip })),
    [],
  );
  const records = job.items;
  const stageOf = (index: number): string =>
    records.find((record) => record.index === index)?.stage ?? items[index]?.stage ?? "QUEUED";
  const current =
    picked ??
    followedIndex(records.map((record) => ({ index: record.index, stage: stageOf(record.index) })));
  const stageLabel = (stage: string): string =>
    STAGE_LABELS[lang][stage as keyof typeof STAGE_LABELS.en] ?? stage;
  const panel = (record: (typeof records)[number], stageChip = false): ReactElement => (
    <ReplayItemPanel
      jobId={jobId}
      record={record}
      item={script.items[record.index]}
      locale={lang}
      text={text}
      needsAudio={needsAudio}
      needsImage={needsImage}
      taskType={job.taskType}
      skipFinished={skipFinished}
      stageChip={stageChip}
      onReplayDone={record.index === current ? onReplayDone : undefined}
      onChip={chipOf(record.index)}
    />
  );

  if (records.length === 1 && records[0]) {
    // One question (always so from the question form): its steps directly, no list of questions to pick from.
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] p-4">{panel(records[0], true)}</div>
    );
  }
  return (
    <ol
      className="space-y-1 rounded-xl border border-[var(--border-subtle)] p-2"
      aria-label={text.items}
    >
      {records.map((record) => {
        // The open question's row shows what the replay is at; the others show what the server says.
        const stage =
          record.index === current
            ? (chips[record.index]?.stage ?? stageOf(record.index))
            : stageOf(record.index);
        return (
          <PlanTaskRow
            key={record.index}
            label={`${text.item} ${record.index + 1}`}
            status={itemStatus(stage)}
            stageLabel={stageLabel(stage)}
            stageTone={ITEM_CHIP_TONES[stage] ?? ITEM_CHIP_TONES.QUEUED}
            expanded={record.index === current}
            onSelect={() => setPicked(record.index)}
          >
            {panel(record)}
          </PlanTaskRow>
        );
      })}
    </ol>
  );
};
