"use client";

import { useCallback, type MutableRefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMonitoringSnapshot, getStudentAttemptHistory } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { PROCTOR_QUERY_KEYS } from "./queryKeys";
import { OperationTracker } from "./operationState";
import { ProctorTransport } from "./transport";
import type {
  ConnectionStatus,
  ProctorOperationResultDto,
  ProctorSessionDto,
  SendViolationPayload,
} from "./transportTypes";

export interface ForceSubmitOptions {
  attemptPublicId: string;
  studentPublicId?: string;
  reason?: string;
  /** Max milliseconds to wait for snapshot to reflect SUBMITTED. Default 10_000 */
  confirmationTimeoutMs?: number;
}

export type ForceSubmitOutcome = "CONFIRMED" | "ACKNOWLEDGED_UNCONFIRMED" | "NO_OP";

export interface ProctorRoomCommandActions {
  forceSubmit: (options: ForceSubmitOptions) => Promise<ForceSubmitOutcome>;
  flagViolation: (payload: SendViolationPayload) => Promise<ProctorOperationResultDto>;
}

interface UseProctorRoomCommandsParams {
  examSessionPublicId: string;
  connectionStatus: ConnectionStatus;
  proctorSession: ProctorSessionDto | null;
  transportRef: MutableRefObject<ProctorTransport | null>;
  trackerRef: MutableRefObject<OperationTracker>;
}

export function useProctorRoomCommands({
  examSessionPublicId,
  connectionStatus,
  proctorSession,
  transportRef,
  trackerRef,
}: UseProctorRoomCommandsParams): ProctorRoomCommandActions {
  const queryClient = useQueryClient();

  const forceSubmit = useCallback(
    async ({
      attemptPublicId,
      studentPublicId,
      confirmationTimeoutMs = 10_000,
    }: ForceSubmitOptions): Promise<ForceSubmitOutcome> => {
      if (connectionStatus !== "CONNECTED") {
        throw new Error("Cannot force submit: STOMP transport is not connected.");
      }
      if (!proctorSession || proctorSession.status !== "ACTIVE") {
        throw new Error("Cannot force submit: proctor session is not active.");
      }

      const requestId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
      const pendingPromise = trackerRef.current.register(
        requestId,
        "FORCE_SUBMIT",
        attemptPublicId,
        10_000,
      );
      // Attach catch handler immediately to prevent unhandled rejection on publish throw or abandon
      pendingPromise.catch(() => {});

      try {
        transportRef.current?.sendForceSubmit(
          proctorSession.publicId,
          attemptPublicId,
          requestId,
        );
      } catch (err) {
        trackerRef.current.cancel(requestId, "Send failed");
        throw err;
      }

      const opResult = await pendingPromise;
      if (opResult.outcome === "NO_OP") {
        return "NO_OP";
      }

      await queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId),
      });

      const pollStart = Date.now();
      while (Date.now() - pollStart < confirmationTimeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Prefer the direct attempt history when the student is known; the monitoring snapshot is page-bounded.
        if (studentPublicId) {
          try {
            const history = await getStudentAttemptHistory(
              apiClient,
              examSessionPublicId,
              studentPublicId,
              0,
              5,
            );
            const targetAttempt = history.data.find(
              (attempt) => attempt.attemptPublicId === attemptPublicId,
            );
            if (targetAttempt?.status === "SUBMITTED") {
              void queryClient.invalidateQueries({
                queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId),
              });
              return "CONFIRMED";
            }
          } catch {
            // Fall through to snapshot confirmation.
          }
        }

        try {
          const updated = await getMonitoringSnapshot(apiClient, examSessionPublicId, 0, 50);
          queryClient.setQueryData(
            PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId, 0, 50),
            updated,
          );
          const targetStudent = updated.students.data.find(
            (student) => student.attemptPublicId === attemptPublicId,
          );
          if (targetStudent?.status === "SUBMITTED") {
            return "CONFIRMED";
          }
        } catch {
          // Retry on the next loop tick.
        }
      }

      return "ACKNOWLEDGED_UNCONFIRMED";
    },
    [connectionStatus, examSessionPublicId, proctorSession, queryClient, trackerRef, transportRef],
  );

  const flagViolation = useCallback(
    async (payload: SendViolationPayload): Promise<ProctorOperationResultDto> => {
      if (connectionStatus !== "CONNECTED") {
        throw new Error("Cannot flag violation: STOMP transport is not connected.");
      }
      if (!proctorSession || proctorSession.status !== "ACTIVE") {
        throw new Error("Cannot flag violation: proctor session is not active.");
      }

      const targetId = payload.attemptPublicId ?? examSessionPublicId;
      const requestId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
      const pendingPromise = trackerRef.current.register(
        requestId,
        "FLAG_VIOLATION",
        targetId,
        10_000,
      );
      // Attach catch handler immediately to prevent unhandled rejection on publish throw or abandon
      pendingPromise.catch(() => {});

      try {
        transportRef.current?.sendFlagViolation(proctorSession.publicId, payload, requestId);
      } catch (err) {
        trackerRef.current.cancel(requestId, "Send failed");
        throw err;
      }

      const result = await pendingPromise;
      void queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.violations(examSessionPublicId),
      });
      void queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId),
      });
      return result;
    },
    [connectionStatus, examSessionPublicId, proctorSession, queryClient, trackerRef, transportRef],
  );

  return { forceSubmit, flagViolation };
}
