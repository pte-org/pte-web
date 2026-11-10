"use client";

import { useEffect, useState, type ReactElement } from "react";
import type { ExaminerPromptResponse } from "@pte/api-client";
import { Alert, Button } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";
import { TranscriptBlock } from "./TranscriptBlock";

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
  // Read Aloud stores the passage itself as its reference; repeating what the prompt already shows adds nothing.
  const reference = prompt.referenceAnswerText?.trim();
  const showReference = Boolean(reference) && reference !== prompt.promptText?.trim();
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
      <h4 className="text-sm font-semibold text-slate-800">{T.PROMPT}</h4>
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
            <li key={`${option.orderIndex}-${option.blankIndex ?? "none"}`}
              className={option.correct ? "font-semibold text-emerald-700" : undefined}>
              {option.text}{option.correct && <span className="ml-2 text-xs font-medium">{T.OPTION_CORRECT}</span>}
            </li>
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
      {(hasAudio || showReference) && <TranscriptBlock
        label={hasAudio ? T.PROMPT_TRANSCRIPT : T.REFERENCE_ANSWER} text={prompt.referenceAnswerText} />}
      {prompt.correctAnswerText && <TranscriptBlock label={T.CORRECT_ANSWER} text={prompt.correctAnswerText} />}
    </section>
  );
};

export { ResponseRenderer } from "./ResponseRenderer";
