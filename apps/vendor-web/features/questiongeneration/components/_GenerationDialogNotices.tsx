"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Alert } from "@pte/ui";
import { batchDetailHref, QUESTION_BANK_PATH } from "../../batchgeneration/constants";
import { useOpenGenerationBatch } from "../api";

import type { GenerationNotice } from "../hooks/useGenerationSubmit";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import type { SelectionProblem } from "../utils/generationSelection";

const LINK_CLASS = "text-[var(--action)] underline-offset-2 hover:underline";

interface NoticesProps {
  notice: GenerationNotice | null;
  problem: SelectionProblem | null;
  cap: number;
  remaining: number | null;
  messages: DialogMessages;
}

/** Server refusals (with a link to the blocking batch when it can be named) and why the selection cannot start. */
export const GenerationDialogNotices = ({ notice, problem, cap, remaining, messages }: NoticesProps): ReactElement => {
  const { data: openBatch } = useOpenGenerationBatch(notice === "alreadyRunning");
  return (
    <div className="space-y-2">
      {notice === "batchDisabled" ? <Alert tone="warning">{messages.batchDisabled}</Alert> : null}
      {notice === "alreadyRunning" ? (
        <Alert tone="warning">
          {messages.alreadyRunning}{" "}
          {openBatch ? (
            <Link className={LINK_CLASS} href={batchDetailHref(openBatch.publicId)}>{messages.openRunningBatch}</Link>
          ) : (
            <Link className={LINK_CLASS} href={QUESTION_BANK_PATH}>{messages.openQuestionBank}</Link>
          )}
        </Alert>
      ) : null}
      {problem && problem !== "EMPTY" ? (
        <Alert tone="error">{formatMessage(messages[`problem${problem}`], { cap, remaining: remaining ?? 0 })}</Alert>
      ) : null}
    </div>
  );
};
