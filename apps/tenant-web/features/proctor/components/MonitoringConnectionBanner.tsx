"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import type { ConnectionStatus } from "../transportTypes";

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
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
          <span>
            {status === "RECONNECTING"
              ? "Mất kết nối thời gian thực. Đang tự động kết nối lại..."
              : "Đang kết nối tới máy chủ giám sát..."}
          </span>
        </div>
      </div>
    );
  }

  if (status === "DENIED") {
    return (
      <div
        role="alert"
        className="flex items-center justify-between rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Phiên giám sát bị từ chối hoặc phân công đã bị thu hồi.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-center justify-between rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
        <span>Mất kết nối với kênh thông báo thời gian thực.</span>
      </div>
      {onReconnect && (
        <Button variant="secondary" size="sm" onClick={onReconnect}>
          Kết nối lại
        </Button>
      )}
    </div>
  );
}
