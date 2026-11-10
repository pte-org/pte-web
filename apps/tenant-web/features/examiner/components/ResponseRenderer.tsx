"use client";

import { useEffect, useState, type ReactElement } from "react";
import type { ExaminerAnswerPayloadResponse } from "@pte/api-client";
import { Alert, Button } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";
import type { MediaState } from "./AnswerContentRenderer";

interface ResponseRendererProps {
  response: ExaminerAnswerPayloadResponse;
  onMediaStateChange?: (state: MediaState) => void;
  onRefreshMedia?: () => void;
}

export const ResponseRenderer = ({
  response,
  onMediaStateChange,
  onRefreshMedia,
}: ResponseRendererProps): ReactElement => {
  const T = useExaminerWorkText();
  const isAudio = response.kind === "AUDIO";
  const isMissingAudio = isAudio && !response.mediaUrl;
  const [audioReady, setAudioReady] = useState(!isAudio);
  const [audioFailed, setAudioFailed] = useState(isMissingAudio);
  const [retryKey, setRetryKey] = useState(0);

  const [prevMediaUrl, setPrevMediaUrl] = useState(response.mediaUrl);
  if (response.mediaUrl !== prevMediaUrl) {
    setPrevMediaUrl(response.mediaUrl);
    if (!isAudio) {
      setAudioReady(true);
      setAudioFailed(false);
    } else if (isMissingAudio) {
      setAudioReady(false);
      setAudioFailed(true);
    } else {
      setAudioReady(false);
      setAudioFailed(false);
    }
  }

  const isBlocked = isAudio && !audioReady;
  const mediaState: MediaState = audioFailed ? "failed" : isBlocked ? "loading" : "ready";

  useEffect(() => {
    onMediaStateChange?.(mediaState);
  }, [mediaState, onMediaStateChange]);

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-label={T.STUDENT_RESPONSE}>
      <h4 className="text-sm font-semibold text-slate-800">{T.STUDENT_RESPONSE}</h4>
      {isAudio ? (
        isMissingAudio ? (
          <div className="mt-2">
            <Alert tone="error" title={T.AUDIO_FAILED}>
              <div>
                <p>{T.AUDIO_UNAVAILABLE}</p>
                {onRefreshMedia && (
                  <Button size="sm" variant="secondary" className="mt-2" onClick={onRefreshMedia}>
                    {T.REFRESH_MEDIA}
                  </Button>
                )}
              </div>
            </Alert>
          </div>
        ) : audioFailed ? (
          <div className="mt-2">
            <Alert tone="error">
              <div className="flex items-center justify-between">
                <span>{T.AUDIO_FAILED}</span>
                <div className="flex gap-2">
                  {onRefreshMedia && (
                    <Button size="sm" variant="secondary" onClick={onRefreshMedia}>
                      {T.REFRESH_MEDIA}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setAudioFailed(false);
                      setAudioReady(false);
                      setRetryKey((k) => k + 1);
                    }}
                  >
                    {T.RETRY}
                  </Button>
                </div>
              </div>
            </Alert>
          </div>
        ) : (
          <>
            {!audioReady && (
              <p className="mt-1 text-xs text-slate-500">{T.LOADING_MEDIA}</p>
            )}
            <audio
              key={`resp-audio-${retryKey}-${response.mediaUrl}`}
              className="mt-2 w-full"
              controls
              preload="metadata"
              src={response.mediaUrl ?? undefined}
              onError={() => {
                setAudioFailed(true);
                setAudioReady(false);
              }}
              onLoadedMetadata={() => {
                setAudioFailed(false);
                setAudioReady(true);
              }}
            >
              {T.AUDIO_UNAVAILABLE}
            </audio>
          </>
        )
      ) : response.kind === "SELECTION" ? (
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {response.options.map((option) => (
            <li
              key={option.orderIndex}
              className={option.selected ? "font-semibold text-blue-800" : ""}
            >
              {option.selected ? T.SELECTED_PREFIX : ""}
              {option.text}
            </li>
          ))}
        </ul>
      ) : response.kind === "POSITIONAL_SELECTION" ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {response.gapValues
            ?.map((value, index) => `${index + 1}. ${value ?? "—"}`)
            .join(" · ") || "—"}
        </p>
      ) : response.kind === "WORD_INDICES" ? (
        <p className="mt-2 text-sm text-slate-700">
          {T.SELECTED_WORD_INDEXES_PREFIX}{response.wordIndices?.join(", ") || "—"}
        </p>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
          {response.text || "—"}
        </p>
      )}
    </section>
  );
};
