"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { ReportPublicationReadinessResponse } from "@pte/api-client";
import { useHostScoreReview, useReportPublicationPreflight } from "../api";

export type ReportPublicationPhase =
  "notClosed" | "published" | "checking" | "blocked" | "ready" | "error";

interface ReportPublicationState {
  phase: ReportPublicationPhase;
  closed: boolean;
  publicationLocked: boolean;
  preflight: UseQueryResult<ReportPublicationReadinessResponse>;
}

/** Runs the readiness check on its own once the session is closed, so every consumer sees the same state. */
export const useReportPublicationState = (
  sessionPublicId: string,
  sessionStatus: string,
): ReportPublicationState => {
  const review = useHostScoreReview(sessionPublicId);
  const closed = sessionStatus === "CLOSED";
  const publicationLocked = review.data?.publicationLocked ?? false;
  const preflight = useReportPublicationPreflight(
    sessionPublicId,
    closed && review.isSuccess && !publicationLocked,
  );
  return { phase: resolvePhase(), closed, publicationLocked, preflight };

  function resolvePhase(): ReportPublicationPhase {
    if (publicationLocked) return "published";
    if (!closed) return "notClosed";
    if (preflight.isError) return "error";
    if (!preflight.data || preflight.isFetching) return "checking";
    return preflight.data.canPublish ? "ready" : "blocked";
  }
};
