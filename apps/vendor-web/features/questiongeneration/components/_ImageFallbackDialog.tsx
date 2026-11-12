"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog, useToast } from "@pte/ui";
import { getUserFacingApiErrorMessage, type QuestionGenerationJobResponse } from "@pte/api-client";
import { useCreateQuestionGenerationJob } from "../api";
import { IMAGE_FAILED_CODE, generationLiveHref, type LiveText } from "../liveConstants";

interface ImageFallbackDialogProps {
  job: QuestionGenerationJobResponse;
  finished: boolean;
  text: LiveText;
}

/**
 * When the image model could not paint a Describe Image picture, the person is asked whether to make those questions
 * as charts instead; nothing is generated again unless they agree.
 */
export const ImageFallbackDialog = ({ job, finished, text }: ImageFallbackDialogProps): ReactElement | null => {
  const router = useRouter();
  const { showToast } = useToast();
  const create = useCreateQuestionGenerationJob();
  const [dismissed, setDismissed] = useState(false);
  const failed = job.items.filter((item) => item.failureCode === IMAGE_FAILED_CODE).length;
  if (!finished || failed === 0) return null;

  const makeCharts = (): void => {
    create.mutate(
      {
        taskType: job.taskType,
        cefrLevel: job.cefrLevel,
        pool: job.pool,
        topicHint: job.topicHint,
        count: failed,
        imageKind: "CHART",
        ...(job.saveQuestions === false ? { saveQuestions: false } : {}),
      },
      {
        onSuccess: (next) => router.push(generationLiveHref(next.publicId)),
        onError: (error) => showToast(getUserFacingApiErrorMessage(error, text.imageFallbackError)),
      },
    );
  };

  return (
    <ConfirmDialog
      open={!dismissed}
      title={text.imageFallbackTitle}
      description={text.imageFallbackBody.replace("{count}", String(failed))}
      confirmLabel={text.imageFallbackConfirm}
      cancelLabel={text.imageFallbackCancel}
      isConfirming={create.isPending}
      onConfirm={makeCharts}
      onClose={() => setDismissed(true)}
    />
  );
};
