"use client";

import { useEffect, useState, type ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, ConfirmDialog, DashboardCard, Skeleton, cn, useDashboardBreadcrumbLabel, useLocale, useToast } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { QUESTIONS_QUERY_KEY } from "@/features/questionbank/constants";
import { useCancelQuestionGenerationJob, useQuestionGenerationTaskTypes } from "../api";
import { useLiveJob } from "../hooks/useLiveJob";
import {
  FORM_RETURN_PAUSE_MS,
  LIVE_TEXT,
  STAGE_LABELS,
  formFillHref,
  TERMINAL_JOB_STATUSES,
} from "../liveConstants";
import { ITEM_CHIP_TONES } from "../liveTones";
import { generatedValues, storeGeneratedFill } from "../utils/generatedFill";
import { followedIndex } from "../utils/liveItems";
import { itemStatus } from "../utils/stepPacing";
import { ImageFallbackDialog } from "./_ImageFallbackDialog";
import { LiveItemPanel } from "./_LiveItemPanel";
import { PlanTaskRow } from "./_PlanTaskRow";

interface LiveGenerationViewProps {
  jobId: string;
}

/** Follows one generation job: the questions as chips, and the one picked as its agents write it. */
export const LiveGenerationView = ({ jobId }: LiveGenerationViewProps): ReactElement => {
  const { locale } = useLocale();
  const lang = locale === "vi" ? "vi" : "en";
  const text = LIVE_TEXT[lang];
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { job: jobQuery, items, connection } = useLiveJob(jobId);
  const { data: taskTypes = [] } = useQuestionGenerationTaskTypes();
  const cancel = useCancelQuestionGenerationJob();
  const [picked, setPicked] = useState<number | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const job = jobQuery.data;
  useDashboardBreadcrumbLabel(pathname, job ? `${text.title}: ${job.taskType}` : undefined);
  // A job started from the question form ends READY, unsaved: take its question back to the form to be checked.
  // The question is handed over in this tab, since the live feed is not followed once the job is over.
  const readyIndex = job?.items.find((record) => record.stage === "READY")?.index;
  const readyValues = readyIndex === undefined ? null : generatedValues(items[readyIndex]);
  // Compared as text, so a re-render with the same question does not restart the pause.
  const readyJson = readyValues ? JSON.stringify(readyValues) : null;
  useEffect(() => {
    if (!readyJson) return;
    storeGeneratedFill(jobId, readyJson);
    const timer = setTimeout(() => router.replace(formFillHref(jobId)), FORM_RETURN_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [readyJson, jobId, router]);

  if (jobQuery.isError) return <Alert tone="error">{text.jobLoadError}</Alert>;
  if (!job) return <Skeleton className="h-96 w-full" />;

  const records = job.items;
  const finished = TERMINAL_JOB_STATUSES.includes(job.status);
  const stageOf = (index: number): string => records.find((record) => record.index === index)?.stage ?? items[index]?.stage ?? "QUEUED";
  const current = picked ?? followedIndex(records.map((record) => ({ index: record.index, stage: stageOf(record.index) })));
  const taskType = taskTypes.find((type) => type.taskType === job.taskType);
  const done = job.succeededCount + job.failedCount;
  const stageLabel = (stage: string): string => STAGE_LABELS[lang][stage as keyof typeof STAGE_LABELS.en] ?? stage;
  const panel = (record: (typeof records)[number]): ReactElement => (
    <LiveItemPanel live={items[record.index]} record={record} locale={lang} text={text}
      needsAudio={taskType?.needsAudio ?? false} needsImage={taskType?.needsImage ?? false} imageKind={job.imageKind} />
  );

  const stop = (): void => cancel.mutate(jobId, {
    onSuccess: () => {
      setConfirmingCancel(false);
      showToast(text.stopRequested);
      void queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
    },
    onError: (error) => {
      setConfirmingCancel(false);
      showToast(getUserFacingApiErrorMessage(error, text.cancelError), { tone: "error" });
    },
  });

  return (
    <DashboardCard className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">{text.title}: <span className="font-mono">{job.taskType}</span></h1>
        <span className="text-sm text-[var(--ink-muted)]">
          {text.progress.replace("{done}", String(done)).replace("{total}", String(job.requestedCount))}
          {job.failedCount > 0 && ` · ${text.failedCount.replace("{count}", String(job.failedCount))}`}
        </span>
        {!finished && connection !== "open" && (
          <span className="text-xs text-[var(--ink-muted)]">{connection === "reconnecting" ? text.reconnecting : text.connecting}</span>
        )}
        <div className="ml-auto flex gap-2">
          {!finished && (
            <Button variant="secondary" onClick={() => setConfirmingCancel(true)}
              disabled={cancel.isPending || job.status === "CANCELLING"}>
              {job.status === "CANCELLING" ? text.stopping : text.cancel}
            </Button>
          )}
        </div>
      </div>
      {records.length === 1 && records[0] ? (
        // One question (always so from the question form): its steps directly, no list of questions to pick from.
        <div className="rounded-xl border border-[var(--border-subtle)] p-4">
          <div className="mb-3 flex justify-end">
            <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", ITEM_CHIP_TONES[stageOf(records[0].index)] ?? ITEM_CHIP_TONES.QUEUED)}>
              {stageLabel(stageOf(records[0].index))}
            </span>
          </div>
          {panel(records[0])}
        </div>
      ) : (
        <ol className="space-y-1 rounded-xl border border-[var(--border-subtle)] p-2" aria-label={text.items}>
          {records.map((record) => {
            const stage = stageOf(record.index);
            return (
              <PlanTaskRow key={record.index} label={`${text.item} ${record.index + 1}`} status={itemStatus(stage)}
                stageLabel={stageLabel(stage)} stageTone={ITEM_CHIP_TONES[stage] ?? ITEM_CHIP_TONES.QUEUED}
                expanded={record.index === current} onSelect={() => setPicked(record.index)}>
                {panel(record)}
              </PlanTaskRow>
            );
          })}
        </ol>
      )}
      <ImageFallbackDialog job={job} finished={finished} text={text} />
      <ConfirmDialog open={confirmingCancel} title={text.cancelTitle} description={text.cancelBody}
        confirmLabel={text.cancelConfirm} cancelLabel={text.cancelBack} tone="warning" isConfirming={cancel.isPending}
        onConfirm={stop} onClose={() => setConfirmingCancel(false)} />
    </DashboardCard>
  );
};
