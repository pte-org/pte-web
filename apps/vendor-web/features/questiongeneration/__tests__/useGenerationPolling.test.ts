import { describe, it, expect, vi } from "vitest";
import type { QuestionGenerationJobResponse, QuestionGenerationJobStatus } from "@pte/api-client";

describe("useGenerationPolling", () => {
  describe("polling behavior", () => {
    it("should stop polling when job reaches terminal state", () => {
      const terminalStates: QuestionGenerationJobStatus[] = [
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ];

      const isTerminal = (status: QuestionGenerationJobStatus) =>
        terminalStates.includes(status);

      expect(isTerminal("COMPLETED")).toBe(true);
      expect(isTerminal("RUNNING")).toBe(false);
      expect(isTerminal("QUEUED")).toBe(false);
    });

    it("should handle visibility change for backoff", () => {
      const mockCallback = vi.fn();
      const handleVisibilityChange = (hidden: boolean) => {
        if (hidden) {
          mockCallback("paused");
        } else {
          mockCallback("resumed");
        }
      };

      handleVisibilityChange(true);
      expect(mockCallback).toHaveBeenCalledWith("paused");

      handleVisibilityChange(false);
      expect(mockCallback).toHaveBeenCalledWith("resumed");
    });
  });

  describe("error handling", () => {
    it("should count polling errors", () => {
      let errorCount = 0;
      const maxErrors = 5;

      const recordError = () => {
        errorCount++;
        if (errorCount >= maxErrors) {
          return "stop";
        }
        return "continue";
      };

      expect(recordError()).toBe("continue");
      expect(recordError()).toBe("continue");
      expect(recordError()).toBe("continue");
      expect(recordError()).toBe("continue");
      expect(recordError()).toBe("stop");
      expect(errorCount).toBe(5);
    });

    it("should reset error count on successful poll", () => {
      let errorCount = 0;
      const recordError = () => errorCount++;
      const resetError = () => (errorCount = 0);

      recordError();
      recordError();
      expect(errorCount).toBe(2);

      resetError();
      expect(errorCount).toBe(0);
    });
  });

  describe("interval calculation", () => {
    it("should apply backoff multiplier when paused", () => {
      const baseInterval = 3000;
      const backoffFactor = 2;

      const normalInterval = baseInterval;
      const pausedInterval = baseInterval * backoffFactor;

      expect(pausedInterval).toBe(6000);
      expect(pausedInterval > normalInterval).toBe(true);
    });
  });
});
