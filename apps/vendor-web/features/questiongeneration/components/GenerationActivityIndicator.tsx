"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { useLocale } from "@pte/ui";
import { useGenerationActivity } from "../hooks/useGenerationActivity";
import { LIVE_TEXT, generationLiveHref } from "../liveConstants";

interface GenerationActivityIndicatorProps {
  /** Only platform admins may see generation jobs. */
  enabled: boolean;
}

/** A pill in the header while the AI is writing questions; it opens the run, wherever the user is. */
export const GenerationActivityIndicator = ({ enabled }: GenerationActivityIndicatorProps): ReactElement | null => {
  const { locale } = useLocale();
  const text = LIVE_TEXT[locale === "vi" ? "vi" : "en"];
  const job = useGenerationActivity(enabled);
  if (!job) return null;
  const done = job.succeededCount + job.failedCount;
  return (
    <Link
      href={generationLiveHref(job.publicId)}
      className="flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-500/30 hover:bg-indigo-500/20 dark:text-indigo-200"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500 dark:bg-indigo-300" />
      <span className="hidden sm:inline">{text.activity}</span>
      <span>{text.activityProgress.replace("{done}", String(done)).replace("{total}", String(job.requestedCount))}</span>
    </Link>
  );
};
