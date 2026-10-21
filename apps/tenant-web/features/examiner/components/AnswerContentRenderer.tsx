"use client";

import { useEffect, useState, type ReactElement } from "react";
import type {
  ExaminerPromptResponse,
  ExaminerAnswerPayloadResponse,
} from "@pte/api-client";
import { Alert, Button } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";

export type MediaState = "ready" | "loading" | "failed";

interface PromptRendererProps {
  prompt: ExaminerPromptResponse;
  onMediaStateChange?: (state: MediaState) => void;
  onRefreshMedia?: () => void;
}

export const PromptRenderer = ({
  prompt,
  onMediaStateChange,
  onRefreshMedia,
}: PromptRendererProps): ReactElement => {
  const T = useExaminerWorkText();
  const hasAudio = Boolean(prompt.audioPromptUrl);
  const hasImage = Boolean(prompt.imagePromptUrl);

  const [audioReady, setAudioReady] = useState(!hasAudio);
  const [audioFailed, setAudioFailed] = useState(false);
  const [imageReady, setImageReady] = useState(!hasImage);
  const [imageFailed, setImageFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const [prevAudioUrl, setPrevAudioUrl] = useState(prompt.audioPromptUrl);
  if (prompt.audioPromptUrl !== prevAudioUrl) {
    setPrevAudioUrl(prompt.audioPromptUrl);
    setAudioReady(!hasAudio);
    setAudioFailed(false);
  }

  const [prevImageUrl, setPrevImageUrl] = useState(prompt.imagePromptUrl);
  if (prompt.imagePromptUrl !== prevImageUrl) {
    setPrevImageUrl(prompt.imagePromptUrl);
    setImageReady(!hasImage);
    setImageFailed(false);
  }

  const isBlocked = (hasAudio && !audioReady) || (hasImage && !imageReady);
  const mediaState: MediaState = audioFailed || imageFailed ? "failed" : isBlocked ? "loading" : "ready";

  useEffect(() => {
    onMediaStateChange?.(mediaState);
  }, [mediaState, onMediaStateChange]);

  return (
    <section className="rounded-xl bg-slate-50 p-5 border border-slate-200 shadow-sm" aria-label={T.PROMPT}>
      <h4 className="text-sm font-semibold text-slate-800">{prompt.title || T.PROMPT}</h4>
      {prompt.promptText && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {prompt.promptText}
        </p>
      )}
      {prompt.minWordCount !== null && prompt.maxWordCount !== null && (
        <p className="mt-2 text-xs text-slate-500">
          {T.WORD_COUNT_PREFIX}{prompt.minWordCount}–{prompt.maxWordCount}
        </p>
      )}
      {prompt.options.length > 0 && (
        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-slate-700">
          {prompt.options.map((option) => (
            <li key={`${option.orderIndex}-${option.blankIndex ?? "none"}`}>{option.text}</li>
          ))}
        </ol>
      )}
      {hasAudio && (
        <div className="mt-3 space-y-2">
          {audioFailed ? (
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
          ) : (
            <>
              {!audioReady && (
                <p className="text-xs text-slate-500">{T.LOADING_MEDIA}</p>
              )}
              <audio
                key={`prompt-audio-${retryKey}-${prompt.audioPromptUrl}`}
                className="w-full"
                controls
                preload="metadata"
                src={prompt.audioPromptUrl ?? undefined}
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
          )}
        </div>
      )}
      {hasImage && (
        <div className="mt-3 space-y-2">
          {imageFailed ? (
            <Alert tone="error">
              <div className="flex items-center justify-between">
                <span>{T.IMAGE_FAILED}</span>
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
                      setImageFailed(false);
                      setImageReady(false);
                      setRetryKey((k) => k + 1);
                    }}
                  >
                    {T.RETRY}
                  </Button>
                </div>
              </div>
            </Alert>
          ) : (
            <>
              {!imageReady && (
                <p className="text-xs text-slate-500">{T.LOADING_MEDIA}</p>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`prompt-img-${retryKey}-${prompt.imagePromptUrl}`}
                className="max-h-96 w-auto max-w-full rounded-md border border-slate-200 object-contain"
                src={prompt.imagePromptUrl ?? undefined}
                alt={T.IMAGE_ALT}
                onError={() => {
                  setImageFailed(true);
                  setImageReady(false);
                }}
                onLoad={() => {
                  setImageFailed(false);
                  setImageReady(true);
                }}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
};

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
