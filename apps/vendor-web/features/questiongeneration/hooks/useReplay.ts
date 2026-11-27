"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  advance,
  endPlayhead,
  frameOf,
  loadPlayhead,
  nextReleased,
  playheadKey,
  samePlayhead,
  savePlayhead,
  START_PLAYHEAD,
  type Frame,
  type FrameContext,
  type ItemScript,
  type Playhead,
  type ReplaySettings,
} from "../replay";

/** Time that passes in one frame is capped, so a tab that was hidden does not make the replay jump when it returns. */
const FRAME_CAP_MS = 250;

export interface ReplayInput {
  jobId: string;
  index: number;
  /** The script of the question; undefined until the stream has sent anything about it. */
  item: ItemScript | undefined;
  context: FrameContext;
  charsPerSecond: number;
  /** Show a question that has finished as it ended instead of replaying it. */
  skipFinished: boolean;
  /** The time source; injected so the engine can be driven without a screen. */
  clock?: () => number;
}

export interface ReplayControls {
  pauseEachStep: boolean;
  setPauseEachStep: (on: boolean) => void;
  /** Let the playhead leave the step it waits at (when the replay pauses after each step). */
  release: () => void;
}

export interface Replay {
  frame: Frame;
  controls: ReplayControls;
}

const defaultClock = (): number => performance.now();

/**
 * The one place that owns the playhead of a question and the clock that moves it. Everything on the screen reads the
 * frame it returns, so no part of it can be ahead of another. The playhead is kept per question for the page, so
 * going back to a question that was watched half way goes on from there.
 */
export function useReplay({
  jobId,
  index,
  item,
  context,
  charsPerSecond,
  skipFinished,
  clock = defaultClock,
}: ReplayInput): Replay {
  const key = playheadKey(jobId, index);
  // A question that is already finished when the replay starts is shown as it ended from the first frame.
  const [playhead, setPlayhead] = useState<Playhead>(
    () => loadPlayhead(key) ?? (item?.ended ? endPlayhead(item, context) : START_PLAYHEAD),
  );
  const [pauseEachStep, setPauseEachStep] = useState(false);
  const settings = useMemo<ReplaySettings>(
    () => ({ charsPerSecond, pauseEachStep, revealAll: false }),
    [charsPerSecond, pauseEachStep],
  );

  const latest = useRef({ item, context, settings, clock, skipFinished });
  useEffect(() => {
    latest.current = { item, context, settings, clock, skipFinished };
  });
  const endedAtFirstBuild = useRef<boolean | null>(item ? item.ended : null);
  const jumped = useRef(item?.ended === true);

  // The clock: every animation frame plays the time that passed, never more than a frame's worth.
  useEffect(() => {
    let frame = 0;
    let last = latest.current.clock();
    const tick = (): void => {
      const now = latest.current.clock();
      const elapsed = Math.min(Math.max(0, now - last), FRAME_CAP_MS);
      last = now;
      const { item: current, context: shape, settings: how, skipFinished: skip } = latest.current;
      if (current) {
        if (endedAtFirstBuild.current === null) endedAtFirstBuild.current = current.ended;
        // Decided once: a later `end` of a question being watched never makes the playhead jump.
        const jump = !jumped.current && current.ended && (endedAtFirstBuild.current || skip);
        if (jump) {
          jumped.current = true;
          setPlayhead(endPlayhead(current, shape));
        } else if (elapsed > 0) {
          setPlayhead((before) => {
            const after = advance(before, current, elapsed, how, shape);
            return samePlayhead(before, after) ? before : after;
          });
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [key]);

  useEffect(() => savePlayhead(key, playhead), [key, playhead]);

  const frame = useMemo(() => frameOf(item, playhead, settings, context), [item, playhead, settings, context]);
  const release = useCallback((): void => {
    const current = latest.current.item;
    if (current) setPlayhead((before) => ({ ...before, released: nextReleased(before, current) }));
  }, []);
  const controls = useMemo<ReplayControls>(
    () => ({ pauseEachStep, setPauseEachStep, release }),
    [pauseEachStep, release],
  );
  return { frame, controls };
}
