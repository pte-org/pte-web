import { Client, type StompSubscription } from "@stomp/stompjs";
import { decodeAccessTokenClaims, type ApiClient } from "@pte/api-client";
import { subscribeTokenRefresh } from "@pte/ui";
import { decodeTopicMessage } from "./decodeTopicMessage";
import type {
  ConnectionStatus,
  LegacyTopicViolationEvent,
  ProctorOperationErrorDto,
  ProctorOperationResultDto,
  ProctorSessionDto,
  SendViolationPayload,
  TopicMessage,
} from "./transportTypes";

export interface ProctorTransportCallbacks {
  onStatusChange?: (status: ConnectionStatus) => void;
  onSessionOpen?: (session: ProctorSessionDto, requestId?: string) => void;
  onOperationResult?: (result: ProctorOperationResultDto) => void;
  onOperationError?: (error: ProctorOperationErrorDto) => void;
  onTopicMessage?: (message: TopicMessage) => void;
}

export interface ProctorTransportOptions {
  apiClient: ApiClient;
  baseUrl: string;
  examSessionPublicId?: string;
  callbacks?: ProctorTransportCallbacks;
  clientFactory?: (options: { brokerURL: string }) => Client;
}

export function resolveWsUrl(baseUrl: string): string {
  const clean = baseUrl.replace(/\/+$/, "");
  if (clean.startsWith("https://")) {
    return clean.replace(/^https:/, "wss:") + "/ws";
  }
  if (clean.startsWith("http://")) {
    return clean.replace(/^http:/, "ws:") + "/ws";
  }
  if (clean.startsWith("ws://") || clean.startsWith("wss://")) {
    return clean.endsWith("/ws") ? clean : clean + "/ws";
  }
  return `ws://${clean}/ws`;
}

const BACKOFF_SCHEDULE = [1000, 2000, 4000, 8000, 16000, 30000];

export class ProctorTransport {
  private client: Client | null = null;
  private readonly apiClient: ApiClient;
  private readonly brokerURL: string;
  private examSessionPublicId: string | null = null;
  private callbacks: ProctorTransportCallbacks;
  private clientFactory?: (options: { brokerURL: string }) => Client;

  private status: ConnectionStatus = "DISCONNECTED";
  private isIntentionalDisconnect = false;
  private isTokenRefreshing = false;
  private reconnectAttempt = 0;
  private subscriptions: StompSubscription[] = [];
  private deduplicatedViolationIds = new Set<string>();
  private unsubscribeTokenRefresh: (() => void) | null = null;
  private tokenExpiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: ProctorTransportOptions) {
    this.apiClient = options.apiClient;
    this.brokerURL = resolveWsUrl(options.baseUrl);
    this.examSessionPublicId = options.examSessionPublicId ?? null;
    this.callbacks = options.callbacks ?? {};
    this.clientFactory = options.clientFactory;
  }

  public setCallbacks(callbacks: ProctorTransportCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setExamSessionPublicId(id: string): void {
    if (this.examSessionPublicId === id) return;
    this.examSessionPublicId = id;
    if (this.status === "CONNECTED") {
      this.resubscribeExamTopic();
    }
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  private setStatus(nextStatus: ConnectionStatus): void {
    if (this.status === nextStatus) return;
    this.status = nextStatus;
    this.callbacks.onStatusChange?.(nextStatus);
  }

  public connect(): void {
    if (this.client && (this.status === "CONNECTING" || this.status === "CONNECTED")) {
      return;
    }
    this.isIntentionalDisconnect = false;

    if (!this.unsubscribeTokenRefresh) {
      this.unsubscribeTokenRefresh = subscribeTokenRefresh((newToken) => {
        void this.handleTokenRefreshed(newToken);
      });
    }

    this.setStatus("CONNECTING");

    const client = this.clientFactory
      ? this.clientFactory({ brokerURL: this.brokerURL })
      : new Client({
          brokerURL: this.brokerURL,
          reconnectDelay: BACKOFF_SCHEDULE[0],
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
        });

    this.client = client;

    client.beforeConnect = async (): Promise<void> => {
      try {
        const token = await this.apiClient.ensureFreshAccessToken({ minValiditySeconds: 30 });
        if (!token) {
          this.setStatus("DENIED");
          throw new Error("No active credentials to establish STOMP connection");
        }
        client.connectHeaders = {
          Authorization: `Bearer ${token}`,
        };
        this.scheduleTokenExpiry(token);
      } catch (err) {
        this.setStatus("DENIED");
        throw err;
      }
    };

    client.onConnect = (): void => {
      this.reconnectAttempt = 0;
      this.setupSubscriptions();
      this.setStatus("CONNECTED");
    };

    client.onDisconnect = (): void => {
      this.cleanupSubscriptions();
      if (this.isTokenRefreshing) {
        return;
      }
      if (this.status !== "DENIED") {
        this.setStatus("DISCONNECTED");
      }
    };

    client.onStompError = (frame): void => {
      this.cleanupSubscriptions();
      const code = frame.headers["message"] ?? "";
      if (code.includes("denied") || code.includes("forbidden") || code.includes("unauthorized")) {
        this.setStatus("DENIED");
      } else {
        this.setStatus("ERROR");
      }
    };

    client.onWebSocketClose = (): void => {
      this.cleanupSubscriptions();
      if (
        this.isIntentionalDisconnect ||
        this.status === "DENIED" ||
        this.status === "DISCONNECTED" ||
        this.isTokenRefreshing
      ) {
        return;
      }

      const delay = BACKOFF_SCHEDULE[Math.min(this.reconnectAttempt, BACKOFF_SCHEDULE.length - 1)] ?? 30000;
      this.reconnectAttempt += 1;
      client.reconnectDelay = delay;
      this.setStatus("RECONNECTING");
    };

    client.activate();
  }

  private setupSubscriptions(): void {
    if (!this.client || !this.client.connected) return;

    this.cleanupSubscriptions();

    // 1. Session open private result: /user/queue/proctor-session
    const subSession = this.client.subscribe("/user/queue/proctor-session", (msg) => {
      try {
        const parsed = JSON.parse(msg.body) as ProctorSessionDto;
        const requestId = msg.headers["requestId"];
        if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.publicId === "string" &&
          parsed.status === "ACTIVE"
        ) {
          this.callbacks.onSessionOpen?.(parsed, requestId);
        }
      } catch {
        // Safe suppression of malformed payload
      }
    });
    this.subscriptions.push(subSession);

    // 2. Correlated private operation results: /user/queue/proctor-results
    const subResults = this.client.subscribe("/user/queue/proctor-results", (msg) => {
      try {
        const parsed = JSON.parse(msg.body) as ProctorOperationResultDto;
        this.callbacks.onOperationResult?.(parsed);
      } catch {
        // Safe suppression
      }
    });
    this.subscriptions.push(subResults);

    // 3. Correlated private operation errors: /user/queue/proctor-errors
    const subErrors = this.client.subscribe("/user/queue/proctor-errors", (msg) => {
      try {
        const parsed = JSON.parse(msg.body) as ProctorOperationErrorDto;
        this.callbacks.onOperationError?.(parsed);
      } catch {
        // Safe suppression
      }
    });
    this.subscriptions.push(subErrors);

    // 4. Legacy errors: /user/queue/errors
    const subLegacyErrors = this.client.subscribe("/user/queue/errors", (msg) => {
      try {
        const parsed = JSON.parse(msg.body) as { status: number; code: string };
        this.callbacks.onOperationError?.({
          requestId: msg.headers["requestId"] ?? "",
          operation: "UNKNOWN",
          status: parsed.status ?? 400,
          code: parsed.code ?? "UNKNOWN_ERROR",
        });
      } catch {
        // Safe suppression
      }
    });
    this.subscriptions.push(subLegacyErrors);

    // 5. Exam topic subscription
    this.resubscribeExamTopic();
  }

  private resubscribeExamTopic(): void {
    if (!this.client || !this.client.connected || !this.examSessionPublicId) return;

    const topicDestination = `/topic/proctor-sessions/${this.examSessionPublicId}`;
    const subTopic = this.client.subscribe(topicDestination, (msg) => {
      const decoded = decodeTopicMessage(msg.body);
      if (decoded.type === "VIOLATION") {
        const v = decoded.event as LegacyTopicViolationEvent;
        if (this.deduplicatedViolationIds.has(v.publicId)) {
          return;
        }
        this.deduplicatedViolationIds.add(v.publicId);
      }
      this.callbacks.onTopicMessage?.(decoded);
    });
    this.subscriptions.push(subTopic);
  }

  private cleanupSubscriptions(): void {
    for (const sub of this.subscriptions) {
      try {
        sub.unsubscribe();
      } catch {
        // Ignore unsubscribe error on disconnected socket
      }
    }
    this.subscriptions = [];
  }

  public openSession(examSessionPublicId: string, requestId?: string): void {
    if (!this.client || !this.client.connected) {
      throw new Error("Cannot open session: STOMP transport is not connected.");
    }
    const headers: Record<string, string> = {};
    if (requestId) headers["requestId"] = requestId;

    this.client.publish({
      destination: `/app/sessions/${examSessionPublicId}/open`,
      headers,
    });
  }

  public sendForceSubmit(
    monitoringSessionPublicId: string,
    attemptPublicId: string,
    requestId: string,
  ): void {
    if (!this.client || !this.client.connected) {
      throw new Error("Cannot send command: STOMP transport is not connected.");
    }
    this.client.publish({
      destination: `/app/proctor-sessions/${monitoringSessionPublicId}/commands`,
      headers: { requestId },
      body: JSON.stringify({
        commandType: "FORCE_SUBMIT",
        attemptPublicId,
      }),
    });
  }

  public sendFlagViolation(
    monitoringSessionPublicId: string,
    payload: SendViolationPayload,
    requestId: string,
  ): void {
    if (!this.client || !this.client.connected) {
      throw new Error("Cannot flag violation: STOMP transport is not connected.");
    }
    if (!payload.attemptPublicId) {
      throw new Error("Cannot flag violation without target attemptPublicId.");
    }
    this.client.publish({
      destination: `/app/proctor-sessions/${monitoringSessionPublicId}/violations`,
      headers: { requestId },
      body: JSON.stringify({
        attemptPublicId: payload.attemptPublicId,
        violationType: payload.violationType,
        detail: payload.detail ?? payload.note ?? null,
      }),
    });
  }

  private scheduleTokenExpiry(token: string): void {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
    const claims = decodeAccessTokenClaims(token);
    if (!claims || !claims.expiresAt) return;

    // Proactively refresh 30 seconds before expiration or immediately if within 30s.
    // Cap at 32-bit signed int maximum (~24.8 days) to avoid setTimeout overflow warning.
    const MAX_TIMEOUT_MS = 2_147_483_647;
    const timeUntilRefreshMs = Math.min(
      MAX_TIMEOUT_MS,
      Math.max(0, claims.expiresAt - Date.now() - 30_000),
    );
    this.tokenExpiryTimer = setTimeout(async () => {
      await this.executeTokenRefresh(token);
    }, timeUntilRefreshMs);
  }

  private async executeTokenRefresh(currentToken: string): Promise<void> {
    if (this.isIntentionalDisconnect || this.status === "DENIED" || this.status === "DISCONNECTED") {
      return;
    }

    try {
      const refreshed = await this.apiClient.ensureFreshAccessToken({
        minValiditySeconds: 60,
        forceRefresh: true,
      });

      const newClaims = refreshed ? decodeAccessTokenClaims(refreshed) : null;
      const isRefreshedNew = Boolean(
        refreshed &&
          refreshed !== currentToken &&
          newClaims &&
          newClaims.expiresAt > Date.now() + 30_000,
      );

      if (isRefreshedNew && refreshed) {
        await this.handleTokenRefreshed(refreshed);
        return;
      }

      this.handleRefreshFailure(currentToken);
    } catch {
      this.handleRefreshFailure(currentToken);
    }
  }

  private handleRefreshFailure(token: string): void {
    if (this.isIntentionalDisconnect || this.status === "DENIED" || this.status === "DISCONNECTED") {
      return;
    }

    const claims = decodeAccessTokenClaims(token);
    const isExpired = !claims || !claims.expiresAt || claims.expiresAt <= Date.now();

    if (isExpired) {
      this.setStatus("DENIED");
      this.disconnect();
    } else {
      // Token is still valid for a short window: retry with backoff instead of immediate loop
      const remainingMs = claims.expiresAt - Date.now();
      const retryDelayMs = Math.min(5000, Math.max(1000, remainingMs - 1000));
      this.tokenExpiryTimer = setTimeout(() => {
        void this.executeTokenRefresh(token);
      }, retryDelayMs);
    }
  }

  private async handleTokenRefreshed(newToken: string): Promise<void> {
    const client = this.client;
    if (!client || this.isIntentionalDisconnect || this.status === "DENIED" || this.status === "DISCONNECTED") {
      return;
    }
    client.connectHeaders = {
      Authorization: `Bearer ${newToken}`,
    };
    this.scheduleTokenExpiry(newToken);
    if (client.active) {
      this.cleanupSubscriptions();
      this.isTokenRefreshing = true;
      try {
        await client.deactivate();
      } finally {
        this.isTokenRefreshing = false;
      }
      if (
        this.isIntentionalDisconnect ||
        (this.status as ConnectionStatus) === "DENIED" ||
        this.client !== client
      ) {
        return;
      }
      client.activate();
    }
  }

  public disconnect(): void {
    this.isIntentionalDisconnect = true;
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
    if (this.unsubscribeTokenRefresh) {
      this.unsubscribeTokenRefresh();
      this.unsubscribeTokenRefresh = null;
    }
    this.cleanupSubscriptions();
    this.deduplicatedViolationIds.clear();
    if (this.client) {
      void this.client.deactivate();
      this.client = null;
    }
    if (this.status !== "DENIED") {
      this.setStatus("DISCONNECTED");
    }
  }
}
