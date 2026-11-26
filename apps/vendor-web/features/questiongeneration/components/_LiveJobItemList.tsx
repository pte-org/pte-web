"use client";

import { useState, type ReactElement } from "react";
import type { QuestionGenerationJobResponse } from "@pte/api-client";
import { cn } from "@pte/ui";
import { STAGE_LABELS, type LiveText } from "../liveConstants";
import { ITEM_CHIP_TONES } from "../liveTones";
import { followedIndex, type LiveItems } from "../utils/liveItems";
import { itemStatus } from "../utils/stepPacing";
import { LiveItemPanel } from "./_LiveItemPanel";
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
  /** Show each question as it ended, without replaying how it was made. */
  instant?: boolean;
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
  instant = false,
}: LiveJobItemListProps): ReactElement => {
  const [picked, setPicked] = useState<number | null>(null);
  const records = job.items;
  const stageOf = (index: number): string =>
    records.find((record) => record.index === index)?.stage ?? items[index]?.stage ?? "QUEUED";
  const current =
    picked ??
    followedIndex(records.map((record) => ({ index: record.index, stage: stageOf(record.index) })));
  const stageLabel = (stage: string): string =>
    STAGE_LABELS[lang][stage as keyof typeof STAGE_LABELS.en] ?? stage;
  const panel = (record: (typeof records)[number]): ReactElement => (
    <LiveItemPanel
      live={items[record.index]}
      record={record}
      locale={lang}
      text={text}
      needsAudio={needsAudio}
      needsImage={needsImage}
      taskType={job.taskType}
      onReplayDone={record.index === current ? onReplayDone : undefined}
      instant={instant}
    />
  );

  if (records.length === 1 && records[0]) {
    // One question (always so from the question form): its steps directly, no list of questions to pick from.
    const stage = stageOf(records[0].index);
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] p-4">
        <div className="mb-3 flex justify-end">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium",
              ITEM_CHIP_TONES[stage] ?? ITEM_CHIP_TONES.QUEUED,
            )}
          >
            {stageLabel(stage)}
          </span>
        </div>
        {panel(records[0])}
      </div>
    );
  }
  return (
    <ol
      className="space-y-1 rounded-xl border border-[var(--border-subtle)] p-2"
      aria-label={text.items}
    >
      {records.map((record) => {
        const stage = stageOf(record.index);
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
