import type {
  ProctorOperationErrorResponse,
  ProctorOperationResultResponse,
  ProctorSessionResponse,
  ViolationEventResponse,
} from "@pte/api-client";

export type ConnectionStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "DENIED"
  | "ERROR";

export type ProctorSessionDto = ProctorSessionResponse;
export type ProctorOperationResultDto = ProctorOperationResultResponse;
export type ProctorOperationErrorDto = ProctorOperationErrorResponse;

export interface LegacyTopicCommandEvent {
  action: "FORCE_SUBMIT";
  examSessionPublicId: string;
  attemptPublicId: string;
  dispatchedAt?: string;
}

export type LegacyTopicViolationEvent = ViolationEventResponse;

export type TopicMessage =
  | { type: "COMMAND"; event: LegacyTopicCommandEvent }
  | { type: "VIOLATION"; event: LegacyTopicViolationEvent }
  | { type: "UNKNOWN"; payload: unknown };

export interface PendingOperation<T> {
  requestId: string;
  operation: "OPEN" | "FORCE_SUBMIT" | "FLAG_VIOLATION";
  targetPublicId: string;
  createdAt: number;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timerId: ReturnType<typeof setTimeout>;
}

export interface SendCommandPayload {
  attemptPublicId: string;
  reason?: string;
}

export interface SendViolationPayload {
  attemptPublicId: string;
  violationType: string;
  detail?: string;
  note?: string;
}
