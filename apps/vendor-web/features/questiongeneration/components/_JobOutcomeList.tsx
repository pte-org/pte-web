"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { QuestionGenerationJobResponse } from "@pte/api-client";
import { Button } from "@pte/ui";
import { questionDetailHref, type LiveText } from "../liveConstants";
import { failureLabel } from "../utils/failureLabel";

interface JobOutcomeListProps {
  job: QuestionGenerationJobResponse;
  lang: "vi" | "en";
  text: LiveText;
}

/** What a finished job left: a button to each saved question, the reason each other one was not saved. */
export const JobOutcomeList = ({ job, lang, text }: JobOutcomeListProps): ReactElement => {
  const router = useRouter();
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{text.results}</h3>
      <ul className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] text-sm">
        {job.items.map((item) => (
          <li key={item.index} className="flex flex-wrap items-center gap-3 px-3 py-2">
            <span className="text-[var(--ink-muted)]">{`${text.item} ${item.index + 1}`}</span>
            {item.questionPublicId ? (
              <Button
                size="sm"
                className="ml-auto"
                onClick={() => router.push(questionDetailHref(item.questionPublicId ?? "", job.batchPublicId))}
              >
                {text.openQuestion}
              </Button>
            ) : item.failureCode ? (
              <span className="text-red-600 dark:text-red-300">
                {text.failedBecause.replace("{reason}", failureLabel(item.failureCode, lang))}
              </span>
            ) : (
              <span className="text-[var(--ink-muted)]">{item.stage === "FAILED" ? text.failed : text.cancelledItem}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
