"use client";

import type { ReactElement } from "react";
import type { ExamPreviewItem } from "@pte/api-client";
import { Alert, Badge, LoadingState, Modal } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAM_PREVIEW_TEXT as T } from "../constants";
import { useSessionExamPreview } from "../api";

interface ExamPreviewModalProps {
  sessionPublicId: string;
  open: boolean;
  onClose: () => void;
}

function PreviewItem({ item }: { item: ExamPreviewItem }): ReactElement {
  const wordCount = T.WORD_COUNT(item.minWordCount, item.maxWordCount);

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-gray-500">#{item.orderIndex + 1}</span>
        <Badge variant="info">{item.section}</Badge>
        <span className="text-sm font-semibold text-gray-900">
          {item.taskTypeDisplayName || item.taskType}
        </span>
        {wordCount && <span className="text-xs text-gray-500">{wordCount}</span>}
      </div>

      {item.title && <h3 className="font-medium text-gray-900">{item.title}</h3>}
      {item.promptText && (
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{item.promptText}</p>
      )}

      {item.imageUrl && (
        // The image is an exam prompt asset, not decorative content.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.title || `${item.taskTypeDisplayName} prompt`}
          className="max-h-96 w-auto max-w-full rounded-md border border-gray-200 object-contain"
        />
      )}

      {item.audioUrl && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {T.AUDIO}
          </span>
          <audio controls preload="none" src={item.audioUrl} className="w-full" />
        </div>
      )}

      {item.options.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {T.OPTIONS}
          </span>
          <ol className="flex flex-col gap-2">
            {item.options.map((option) => (
              <li
                key={`${option.orderIndex}-${option.blankIndex ?? "all"}-${option.text}`}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800"
              >
                {option.text}
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}

export const ExamPreviewModal = ({
  sessionPublicId,
  open,
  onClose,
}: ExamPreviewModalProps): ReactElement => {
  const preview = useSessionExamPreview(sessionPublicId, open);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={preview.data?.name ? `${T.TITLE}: ${preview.data.name}` : T.TITLE}
      size="full"
    >
      {preview.isLoading ? (
        <LoadingState rows={5} />
      ) : preview.isError ? (
        <Alert tone="error">{errorMessage(preview.error)}</Alert>
      ) : !preview.data ? (
        <Alert tone="info">{T.UNAVAILABLE}</Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              {T.ITEM_COUNT(preview.data.items.length)} · v{preview.data.version}
            </p>
            <p className="text-xs text-gray-500">{T.ANSWER_KEY_NOTICE}</p>
          </div>
          {preview.data.items.map((item) => (
            <PreviewItem key={item.orderIndex} item={item} />
          ))}
        </div>
      )}
    </Modal>
  );
};
