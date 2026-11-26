"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceSampleLoader } from "../voiceApi";

export interface VoiceSamplePlayer {
  /** The voice whose sample is being fetched right now, if any. */
  loadingVoice: string | null;
  failed: boolean;
  play: (voice: string) => void;
}

/** Plays the sample of one voice at a time; starting another stops the first. */
export function useVoiceSamplePlayer(): VoiceSamplePlayer {
  const loadSample = useVoiceSampleLoader();
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback((): void => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback(
    (voice: string): void => {
      stop();
      setFailed(false);
      setLoadingVoice(voice);
      loadSample(voice)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          urlRef.current = url;
          audioRef.current = audio;
          return audio.play();
        })
        .catch(() => setFailed(true))
        .finally(() => setLoadingVoice(null));
    },
    [loadSample, stop],
  );

  return { loadingVoice, failed, play };
}
