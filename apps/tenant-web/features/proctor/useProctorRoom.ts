"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeSessionLifecycle } from "@pte/ui";
import { getMonitoringSnapshot, getStudentAttemptHistory } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/features/auth/constants";
import { PROCTOR_QUERY_KEYS } from "./queryKeys";
import { OperationTracker } from "./operationState";
import { ProctorTransport } from "./transport";
import type {
  ConnectionStatus,
  LegacyTopicCommandEvent,
  ProctorOperationResultDto,
  ProctorSessionDto,
  SendViolationPayload,
  TopicMessage,
} from "./transportTypes";

export interface ForceSubmitOptions {
  attemptPublicId: string;
  studentPublicId?: string;
  reason?: string;
  /** Max milliseconds to wait for snapshot to reflect SUBMITTED. Default 10_000 */
  confirmationTimeoutMs?: number;
}

export type ForceSubmitOutcome = "CONFIRMED" | "ACKNOWLEDGED_UNCONFIRMED" | "NO_OP";

export interface UseProctorRoomReturn {
  connectionStatus: ConnectionStatus;
  proctorSession: ProctorSessionDto | null;
  isOpenPending: boolean;
  openError: string | null;
  openSession: () => Promise<ProctorSessionDto>;
  forceSubmit: (options: ForceSubmitOptions) => Promise<ForceSubmitOutcome>;
  flagViolation: (payload: SendViolationPayload) => Promise<ProctorOperationResultDto>;
  reconnect: () => void;
  disconnect: () => void;
}

export function useProctorRoom(examSessionPublicId: string): UseProctorRoomReturn {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("DISCONNECTED");
  const [proctorSession, setProctorSession] = useState<ProctorSessionDto | null>(null);
  const [isOpenPending, setIsOpenPending] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const trackerRef = useRef<OperationTracker>(new OperationTracker(10_000));
  const transportRef = useRef<ProctorTransport | null>(null);
  const openPromiseResolverRef = useRef<{
    resolve: (val: ProctorSessionDto) => void;
    reject: (err: Error) => void;
    timerId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const handleTopicMessage = useCallback(
    (msg: TopicMessage): void => {
      if (msg.type === "COMMAND") {
        const cmd = msg.event as LegacyTopicCommandEvent;
        // Invalidate monitoring query so roster picks up the latest state
        void queryClient.invalidateQueries({
          queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId),
        });
        if (cmd.attemptPublicId) {
          void queryClient.invalidateQueries({
            queryKey: PROCTOR_QUERY_KEYS.all,
          });
        }
      } else if (msg.type === "VIOLATION") {
        void queryClient.invalidateQueries({
          queryKey: PROCTOR_QUERY_KEYS.violations(examSessionPublicId),
        });
        void queryClient.invalidateQueries({
          queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId),
        });
      }
    },
    [examSessionPublicId, queryClient],
  );

  useEffect(() => {
    const tracker = trackerRef.current;
    const transport = new ProctorTransport({
      apiClient,
      baseUrl: API_BASE_URL,
      examSessionPublicId,
      callbacks: {
        onStatusChange: (status) => {
          setConnectionStatus(status);
          if (status === "CONNECTED") {
            setIsOpenPending(true);
            setOpenError(null);
            const reqId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
            const timerId = setTimeout(() => {
              setIsOpenPending(false);
              setOpenError("Yêu cầu mở phiên giám sát hết thời gian chờ (timeout). Bạn có thể bấm thử lại.");
              openPromiseResolverRef.current = null;
            }, 10_000);
            openPromiseResolverRef.current = {
              resolve: (val) => {
                setProctorSession(val);
                setIsOpenPending(false);
                setOpenError(null);
              },
              reject: (err) => {
                setIsOpenPending(false);
                setOpenError(err.message);
              },
              timerId,
            };
            try {
              transport.openSession(examSessionPublicId, reqId);
            } catch (err) {
              clearTimeout(timerId);
              setIsOpenPending(false);
              setOpenError(err instanceof Error ? err.message : "Failed to open session");
              openPromiseResolverRef.current = null;
            }
          } else if (status === "DENIED" || status === "ERROR" || status === "DISCONNECTED") {
            if (openPromiseResolverRef.current) {
              clearTimeout(openPromiseResolverRef.current.timerId);
              openPromiseResolverRef.current.reject(new Error(`Socket disconnected (${status})`));
              openPromiseResolverRef.current = null;
            }
            setIsOpenPending(false);
            if (status === "DENIED") {
              setOpenError("Truy cập bị từ chối (403/DENIED). Bạn không có quyền giám sát phiên này.");
            }
          }
        },
        onSessionOpen: (session, requestId) => {
          if (!session || !session.publicId || session.status !== "ACTIVE") {
            return;
          }
          if (session.sessionPublicId && session.sessionPublicId !== examSessionPublicId) {
            return;
          }
          setProctorSession(session);
          setIsOpenPending(false);
          setOpenError(null);
          if (openPromiseResolverRef.current) {
            clearTimeout(openPromiseResolverRef.current.timerId);
            openPromiseResolverRef.current.resolve(session);
            openPromiseResolverRef.current = null;
          }
          if (requestId) {
            tracker.handleResult({
              requestId,
              operation: "OPEN",
              targetPublicId: examSessionPublicId,
              outcome: "OPENED",
              occurredAt: new Date().toISOString(),
            });
          }
        },
        onOperationResult: (result) => {
          tracker.handleResult(result);
        },
        onOperationError: (error) => {
          tracker.handleError(error);
          if (openPromiseResolverRef.current) {
            clearTimeout(openPromiseResolverRef.current.timerId);
            openPromiseResolverRef.current.reject(new Error(error.code || "Yêu cầu mở phiên bị từ chối"));
            openPromiseResolverRef.current = null;
          }
          setIsOpenPending(false);
          setOpenError(error.code || "Yêu cầu thực hiện thất bại");
        },
        onTopicMessage: handleTopicMessage,
      },
    });

    transportRef.current = transport;
    transport.connect();

    // Reset and disconnect on session lifecycle change (logout / account switch)
    const unsubscribeLifecycle = subscribeSessionLifecycle(() => {
      tracker.reset("Session identity changed");
      transport.disconnect();
      setProctorSession(null);
    });

    return () => {
      unsubscribeLifecycle();
      if (openPromiseResolverRef.current) {
        clearTimeout(openPromiseResolverRef.current.timerId);
        openPromiseResolverRef.current.reject(new Error("Component unmounted"));
        openPromiseResolverRef.current = null;
      }
      tracker.reset("Component unmounted");
      transport.disconnect();
    };
  }, [examSessionPublicId, handleTopicMessage]);

  const openSession = useCallback((): Promise<ProctorSessionDto> => {
    setIsOpenPending(true);
    setOpenError(null);

    return new Promise<ProctorSessionDto>((resolve, reject) => {
      const timerId = setTimeout(() => {
        setIsOpenPending(false);
        setOpenError("Yêu cầu mở phiên giám sát hết thời gian chờ (timeout). Bạn có thể bấm thử lại.");
        openPromiseResolverRef.current = null;
        reject(new Error("Session open timed out"));
      }, 10_000);

      openPromiseResolverRef.current = { resolve, reject, timerId };

      try {
        const requestId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
        transportRef.current?.openSession(examSessionPublicId, requestId);
      } catch (err) {
        clearTimeout(timerId);
        setIsOpenPending(false);
        const message = err instanceof Error ? err.message : "Failed to open session";
        setOpenError(message);
        openPromiseResolverRef.current = null;
        reject(err instanceof Error ? err : new Error(message));
      }
    });
  }, [examSessionPublicId]);

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

      // Immediately refetch snapshot to observe status
      await queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId),
      });

      // Poll until attempt is confirmed SUBMITTED or timeout
      const pollStart = Date.now();
      while (Date.now() - pollStart < confirmationTimeoutMs) {
        await new Promise((r) => setTimeout(r, 1000));

        // If studentPublicId is provided, check the student's attempt history directly (not bounded by first 50 roster items)
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
              (a) => a.attemptPublicId === attemptPublicId,
            );
            if (targetAttempt && targetAttempt.status === "SUBMITTED") {
              void queryClient.invalidateQueries({
                queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId),
              });
              return "CONFIRMED";
            }
          } catch {
            // Fall through to snapshot check
          }
        }

        try {
          const updated = await getMonitoringSnapshot(apiClient, examSessionPublicId, 0, 50);
          queryClient.setQueryData(
            PROCTOR_QUERY_KEYS.monitoringSnapshot(examSessionPublicId, 0, 50),
            updated,
          );
          const targetStudent = updated.students.data.find(
            (s) => s.attemptPublicId === attemptPublicId,
          );
          if (targetStudent && targetStudent.status === "SUBMITTED") {
            return "CONFIRMED";
          }
        } catch {
          // Retry on next loop tick
        }
      }

      return "ACKNOWLEDGED_UNCONFIRMED";
    },
    [connectionStatus, examSessionPublicId, proctorSession, queryClient],
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
    [connectionStatus, examSessionPublicId, proctorSession, queryClient],
  );

  const reconnect = useCallback((): void => {
    transportRef.current?.connect();
  }, []);

  const disconnect = useCallback((): void => {
    transportRef.current?.disconnect();
  }, []);

  return {
    connectionStatus,
    proctorSession,
    isOpenPending,
    openError,
    openSession,
    forceSubmit,
    flagViolation,
    reconnect,
    disconnect,
  };
}
