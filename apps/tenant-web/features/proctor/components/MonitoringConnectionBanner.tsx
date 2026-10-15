"use client";

import type { ReactElement } from "react";
import { Alert, Button } from "@pte/ui";
import type { ConnectionStatus } from "../transportTypes";
import { PROCTOR_LIVE_TEXT } from "../constants";

interface MonitoringConnectionBannerProps {
  status: ConnectionStatus;
  onReconnect?: () => void;
}

export function MonitoringConnectionBanner({
  status,
  onReconnect,
}: MonitoringConnectionBannerProps): ReactElement | null {
  if (status === "CONNECTED") {
    return null;
  }

  if (status === "CONNECTING" || status === "RECONNECTING") {
    return (
      <Alert tone="warning">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
          <span>
            {status === "RECONNECTING"
              ? PROCTOR_LIVE_TEXT.RECONNECTING_ROOM
              : PROCTOR_LIVE_TEXT.CONNECTING_ROOM}
          </span>
        </div>
      </Alert>
    );
  }

  if (status === "DENIED") {
    return (
      <Alert tone="error">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>{PROCTOR_LIVE_TEXT.DENIED_ROOM}</span>
        </div>
      </Alert>
    );
  }

  return (
    <Alert tone="error">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>{PROCTOR_LIVE_TEXT.DISCONNECTED_ROOM}</span>
        </div>
        {onReconnect && (
          <Button variant="secondary" size="sm" onClick={onReconnect}>
            {PROCTOR_LIVE_TEXT.RECONNECT_BTN}
          </Button>
        )}
      </div>
    </Alert>
  );
}
