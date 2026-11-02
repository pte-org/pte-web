"use client";

import { useRef, useState, type ReactElement } from "react";
import {
  EXAM_SCREEN_METER_LIVE_SEGMENTS,
  EXAM_SCREEN_METER_SEGMENTS,
  EXAM_SCREEN_TEXT,
} from "../examScreenPreviewConstants";
import { formatClock } from "../examScreenTime";

interface PreviewAudioPanelProps {
  variant: "player" | "recorder";
  /** The audio to play (player only); without it the player shows its empty state. */
  src?: string | null;
  /** Length of the answer in seconds (recorder only), from the exam template when known. */
  totalSeconds?: number | null;
}

const controlCell =
  "flex h-14 w-16 shrink-0 items-center justify-center border-r border-[var(--exam-audio-divider)] text-[var(--exam-text)] disabled:text-[var(--exam-text-muted)]";

/** The app's Audio Player / Audio Recorder panel: title and status, level meter, control row. */
export const PreviewAudioPanel = ({
  variant,
  src = null,
  totalSeconds = null,
}: PreviewAudioPanelProps): ReactElement => {
  const isPlayer = variant === "player";
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const total = isPlayer ? duration : (totalSeconds ?? 0);
  const togglePlay = (): void => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-sm border border-[var(--exam-audio-border)] bg-[var(--exam-audio-surface)] text-[var(--exam-text)]">
      <div className="flex h-40">
        <div className="flex min-w-0 flex-1 flex-col p-6">
          <p className="text-lg">
            {isPlayer ? EXAM_SCREEN_TEXT.AUDIO_PLAYER : EXAM_SCREEN_TEXT.AUDIO_RECORDER}
          </p>
          <p className="flex flex-1 items-center justify-center text-center text-lg text-[var(--exam-audio-status)]">
            {isPlayer && !src
              ? EXAM_SCREEN_TEXT.EMPTY_AUDIO
              : isPlayer
                ? EXAM_SCREEN_TEXT.PLAYER_READY
                : EXAM_SCREEN_TEXT.RECORDER_WAITING}
          </p>
        </div>
        <div className="flex w-16 shrink-0 flex-col justify-end gap-0.5 border-l border-[var(--exam-audio-divider)] px-4 pb-4">
          {Array.from({ length: EXAM_SCREEN_METER_SEGMENTS }, (_, index) => (
            <span
              key={index}
              className={
                playing && index >= EXAM_SCREEN_METER_SEGMENTS - EXAM_SCREEN_METER_LIVE_SEGMENTS
                  ? "h-0.5 bg-[var(--exam-audio-meter)]"
                  : "h-0.5 bg-[var(--exam-audio-track)]"
              }
            />
          ))}
        </div>
      </div>
      <div className="flex h-14 items-center border-t border-[var(--exam-audio-divider)]">
        {isPlayer ? (
          <button
            type="button"
            className={controlCell}
            disabled={!src}
            aria-label={playing ? EXAM_SCREEN_TEXT.PAUSE : EXAM_SCREEN_TEXT.PLAY}
            onClick={togglePlay}
          >
            {playing ? "❚❚" : "▶"}
          </button>
        ) : (
          <>
            <button type="button" className={controlCell} disabled aria-label={EXAM_SCREEN_TEXT.RECORD}>
              <span className="size-3 rounded-full bg-[var(--exam-record)]" />
            </button>
            <button type="button" className={controlCell} disabled aria-label={EXAM_SCREEN_TEXT.STOP}>
              ■
            </button>
          </>
        )}
        <input
          className="mx-4 h-1 min-w-0 flex-1 accent-[var(--exam-audio-progress)]"
          type="range"
          min={0}
          max={total > 0 ? total : 1}
          step={0.1}
          value={isPlayer ? position : 0}
          disabled={!isPlayer || !src}
          aria-label={EXAM_SCREEN_TEXT.SEEK}
          onChange={(event) => {
            const next = Number(event.target.value);
            setPosition(next);
            if (audioRef.current) audioRef.current.currentTime = next;
          }}
        />
        <span className="shrink-0 pr-4 text-sm tabular-nums">
          {formatClock(isPlayer ? position : 0)} / {formatClock(total)}
        </span>
      </div>
      {isPlayer && src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        />
      )}
    </div>
  );
};
