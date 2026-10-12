"use client";

import { useEffect, useState, type ReactElement } from "react";
import type {
  ExaminerPromptResponse,
  ExaminerAnswerPayloadResponse,
} from "@pte/api-client";
import { Button } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T } from "../constants";

interface PromptRendererProps {
  prompt: ExaminerPromptResponse;
  onMediaError?: (hasErrorOrLoading: boolean) => void;
  onRefreshMedia?: () => void;
}

export const PromptRenderer = ({
  prompt,
  onMediaError,
  onRefreshMedia,
}: PromptRendererProps): ReactElement => {
  const hasAudio = Boolean(prompt.audioPromptUrl);
  const hasImage = Boolean(prompt.imagePromptUrl);

  const [audioReady, setAudioReady] = useState(!hasAudio);
  const [audioFailed, setAudioFailed] = useState(false);
  const [imageReady, setImageReady] = useState(!hasImage);
  const [imageFailed, setImageFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setAudioReady(!hasAudio);
    setAudioFailed(false);
  }, [hasAudio, prompt.audioPromptUrl]);

  useEffect(() => {
    setImageReady(!hasImage);
    setImageFailed(false);
  }, [hasImage, prompt.imagePromptUrl]);

  const isBlocked = (hasAudio && !audioReady) || (hasImage && !imageReady);

  useEffect(() => {
    onMediaError?.(isBlocked);
  }, [isBlocked, onMediaError]);

  return (
    <section className="rounded-md bg-slate-50 p-4 border border-slate-200" aria-label={T.PROMPT}>
      <h4 className="text-sm font-semibold text-slate-800">{prompt.title || T.PROMPT}</h4>
      {prompt.promptText && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {prompt.promptText}
        </p>
      )}
      {prompt.minWordCount !== null && prompt.maxWordCount !== null && (
        <p className="mt-2 text-xs text-slate-500">
          Word count: {prompt.minWordCount}–{prompt.maxWordCount}
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
            <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
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
            <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
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
  onMediaError?: (hasErrorOrLoading: boolean) => void;
  onRefreshMedia?: () => void;
}

export const ResponseRenderer = ({
  response,
  onMediaError,
  onRefreshMedia,
}: ResponseRendererProps): ReactElement => {
  const isAudio = response.kind === "AUDIO";
  const isMissingAudio = isAudio && !response.mediaUrl;
  const [audioReady, setAudioReady] = useState(!isAudio);
  const [audioFailed, setAudioFailed] = useState(isMissingAudio);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
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
  }, [isAudio, isMissingAudio, response.mediaUrl]);

  const isBlocked = isAudio && !audioReady;

  useEffect(() => {
    onMediaError?.(isBlocked);
  }, [isBlocked, onMediaError]);

  return (
    <section className="mt-4 rounded-md border border-slate-200 bg-white p-4" aria-label={T.STUDENT_RESPONSE}>
      <h4 className="text-sm font-semibold text-slate-800">{T.STUDENT_RESPONSE}</h4>
      {isAudio ? (
        isMissingAudio ? (
          <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <p className="font-semibold">{T.AUDIO_FAILED}</p>
            <p className="mt-0.5">{T.AUDIO_UNAVAILABLE}</p>
            {onRefreshMedia && (
              <Button size="sm" variant="secondary" className="mt-2" onClick={onRefreshMedia}>
                {T.REFRESH_MEDIA}
              </Button>
            )}
          </div>
        ) : audioFailed ? (
          <div className="mt-2 flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
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
              {option.selected ? "Selected: " : ""}
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
          Selected word indexes: {response.wordIndices?.join(", ") || "—"}
        </p>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
          {response.text || "—"}
        </p>
      )}
    </section>
  );
};
