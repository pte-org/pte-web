import { useEffect, useRef, useState } from "react";
import { useQuestionGenerationJob } from "../api";
import {
  GENERATION_POLL_INTERVAL_MS,
  GENERATION_POLL_BACKOFF_FACTOR,
} from "../constants";
import type { QuestionGenerationJobStatus } from "@pte/api-client";

const TERMINAL_STATES: readonly string[] = [
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

export interface UseGenerationPollingOptions {
  /** Enable polling; default true */
  enabled?: boolean;
  /** Callback when job reaches terminal state */
  onComplete?: (status: QuestionGenerationJobStatus) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Hook for polling a generation job with smart backoff
 *
 * - Polls every 3 seconds while active
 * - Pauses polling when tab is hidden (via visibilitychange)
 * - Applies backoff multiplier when paused
 * - Stops polling when job reaches terminal state
 * - Cleans up on unmount
 */
export function useGenerationPolling(
  jobId: string | null,
  options: UseGenerationPollingOptions = {},
) {
  const { enabled = true, onComplete, onError } = options;
  const [isPaused, setIsPaused] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef(0);

  const { data: job, isLoading, error, refetch } = useQuestionGenerationJob(jobId);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
        // Immediately refetch when tab becomes visible again
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refetch]);

  // Polling effect
  useEffect(() => {
    if (!enabled || !jobId) return;

    const isComplete = job && TERMINAL_STATES.includes(job.status);
    if (isComplete) {
      if (onComplete && job) {
        onComplete(job.status as QuestionGenerationJobStatus);
      }
      return;
    }

    if (error) {
      errorCountRef.current++;
      if (onError) {
        onError(error);
      }
      // Stop polling after too many errors
      if (errorCountRef.current > 5) {
        return;
      }
    } else {
      errorCountRef.current = 0;
    }

    const interval = isPaused
      ? GENERATION_POLL_INTERVAL_MS * GENERATION_POLL_BACKOFF_FACTOR
      : GENERATION_POLL_INTERVAL_MS;

    pollIntervalRef.current = setInterval(() => {
      if (!isPaused) {
        refetch();
      }
    }, interval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [enabled, jobId, job, isPaused, error, onComplete, onError, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    job,
    isLoading,
    error,
    isPaused,
    isComplete: job && TERMINAL_STATES.includes(job.status),
  };
}
