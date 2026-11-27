"use client";

import { useMemo, type ReactElement } from "react";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { ExamScreenPreview } from "@/features/questionbank/components/ExamScreenPreview";
import { usePromptMedia } from "@/features/questionbank/hooks/usePromptMediaUrl";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { livePreviewDraft } from "../utils/livePreviewDraft";
import type { PieceKey } from "../utils/livePieces";

interface LiveExamPreviewProps {
  taskType: string;
  live: QuestionGenerationLiveItem | undefined;
  /** The writer's draft as typed so far, so the screen fills in with the text. */
  typed: unknown;
  /** Pieces already carried onto the screen; the others stay empty until they land. */
  placed: ReadonlySet<PieceKey>;
}

/** The student's exam screen for the question being written, redrawn as its agents write it and make its media. */
export const LiveExamPreview = ({
  taskType,
  live,
  typed,
  placed,
}: LiveExamPreviewProps): ReactElement => {
  const { data: questionTypes = [] } = useQuestionTypes(false);
  const { url: audioUrl } = usePromptMedia(live?.audioRef ?? null);
  const { url: imageUrl } = usePromptMedia(live?.imageRef ?? null);
  const questionType = questionTypes.find(
    (type) => type.code === taskType || type.taskTypeKey === taskType,
  );
  const fields = live?.draft?.fields ?? null;
  const draft = useMemo(() => {
    const full = livePreviewDraft({ taskType, questionType, typed, fields, audioUrl, imageUrl });
    return {
      ...full,
      promptText: placed.has("prompt") ? full.promptText : "",
      options: placed.has("options") ? full.options : [],
      audioUrl: placed.has("audio") ? full.audioUrl : null,
      imageUrl: placed.has("image") ? full.imageUrl : null,
    };
  }, [taskType, questionType, typed, fields, audioUrl, imageUrl, placed]);
  return <ExamScreenPreview draft={draft} />;
};
