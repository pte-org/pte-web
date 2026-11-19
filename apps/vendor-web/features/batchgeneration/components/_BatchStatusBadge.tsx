import type { ReactElement } from "react";
import type { QuestionGenerationBatchStatus, QuestionGenerationJobStatus } from "@pte/api-client";
import { Badge } from "@pte/ui";
import { BATCH_STATUS_VARIANT, JOB_STATUS_VARIANT } from "../constants";
import type { BatchMessages } from "../messages/en";

type StatusKey = `status${QuestionGenerationBatchStatus | QuestionGenerationJobStatus}`;

interface BatchStatusBadgeProps {
  status: QuestionGenerationBatchStatus;
  messages: BatchMessages;
}

export const BatchStatusBadge = ({ status, messages }: BatchStatusBadgeProps): ReactElement => (
  <Badge variant={BATCH_STATUS_VARIANT[status] ?? "neutral"}>{messages[`status${status}` as StatusKey] ?? status}</Badge>
);

interface JobStatusBadgeProps {
  status: QuestionGenerationJobStatus;
  messages: BatchMessages;
}

export const JobStatusBadge = ({ status, messages }: JobStatusBadgeProps): ReactElement => (
  <Badge variant={JOB_STATUS_VARIANT[status] ?? "neutral"}>{messages[`status${status}` as StatusKey] ?? status}</Badge>
);
