import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProctorSessionDto } from "@/features/proctor/transportTypes";
import { OperationTracker } from "@/features/proctor/operationState";

const hoisted = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  apiClient: { request: "stub" },
  transportSendForceSubmit: vi.fn(),
  transportSendFlagViolation: vi.fn(),
  transportConnect: vi.fn(),
  transportDisconnect: vi.fn(),
  transportOpenSession: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: hoisted.invalidateQueries,
    setQueryData: hoisted.setQueryData,
  }),
}));

vi.mock("@pte/ui", () => ({
  subscribeSessionLifecycle: vi.fn(() => () => {}),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@/features/auth/constants", () => ({ API_BASE_URL: "https://api.test" }));

vi.mock("@/features/proctor/transport", () => ({
  ProctorTransport: class MockProctorTransport {
    connect = hoisted.transportConnect;
    disconnect = hoisted.transportDisconnect;
    openSession = hoisted.transportOpenSession;
    sendForceSubmit = hoisted.transportSendForceSubmit;
    sendFlagViolation = hoisted.transportSendFlagViolation;
  },
}));

import { useProctorRoomCommands } from "@/features/proctor/useProctorRoomCommands";
import { useProctorRoom } from "@/features/proctor/useProctorRoom";

describe("features/proctor - Room & Commands Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useProctorRoomCommands", () => {
    it("throws if transport is not connected when calling forceSubmit or flagViolation", async () => {
      let commands!: ReturnType<typeof useProctorRoomCommands>;
      const trackerRef = { current: new OperationTracker(10_000) };
      const transportRef = { current: null };

      renderToStaticMarkup(createElement(() => {
        commands = useProctorRoomCommands({
          connectionStatus: "DISCONNECTED",
          examSessionPublicId: "sess-1",
          proctorSession: null,
          trackerRef,
          transportRef,
        });
        return null;
      }));

      await expect(
        commands.forceSubmit({ attemptPublicId: "att-1" }),
      ).rejects.toThrow("Cannot force submit: STOMP transport is not connected.");

      await expect(
        commands.flagViolation({
          attemptPublicId: "att-1",
          violationType: "TAB_SWITCH",
        }),
      ).rejects.toThrow("Cannot flag violation: STOMP transport is not connected.");
    });

    it("throws if proctor session is not ACTIVE", async () => {
      let commands!: ReturnType<typeof useProctorRoomCommands>;
      const trackerRef = { current: new OperationTracker(10_000) };
      const transportRef = { current: null };
      const inactiveSession: ProctorSessionDto = {
        publicId: "proc-1",
        status: "CLOSED",
        openedAt: "2026-05-01T09:00:00Z",
      } as unknown as ProctorSessionDto;

      renderToStaticMarkup(createElement(() => {
        commands = useProctorRoomCommands({
          connectionStatus: "CONNECTED",
          examSessionPublicId: "sess-1",
          proctorSession: inactiveSession,
          trackerRef,
          transportRef,
        });
        return null;
      }));

      await expect(
        commands.forceSubmit({ attemptPublicId: "att-1" }),
      ).rejects.toThrow("Cannot force submit: proctor session is not active.");

      await expect(
        commands.flagViolation({
          attemptPublicId: "att-1",
          violationType: "TAB_SWITCH",
        }),
      ).rejects.toThrow("Cannot flag violation: proctor session is not active.");
    });
  });

  describe("useProctorRoom", () => {
    it("initializes with DISCONNECTED status and initial state", () => {
      let room!: ReturnType<typeof useProctorRoom>;
      renderToStaticMarkup(createElement(() => {
        room = useProctorRoom("sess-1");
        return null;
      }));

      expect(room.connectionStatus).toBe("DISCONNECTED");
      expect(room.proctorSession).toBeNull();
      expect(room.isOpenPending).toBe(false);
      expect(room.openError).toBeNull();
      expect(typeof room.openSession).toBe("function");
      expect(typeof room.reconnect).toBe("function");
      expect(typeof room.disconnect).toBe("function");
      expect(typeof room.forceSubmit).toBe("function");
      expect(typeof room.flagViolation).toBe("function");
    });
  });
});

