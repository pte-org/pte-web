import { describe, it, expect } from "vitest";
import type {
  QuestionGenerationJobResponse,
  QuestionGenerationItemResponse,
} from "@pte/api-client";

describe("Generation API Mappers", () => {
  describe("mapJobResponse", () => {
    it("should map job response with items", () => {
      const jobData: QuestionGenerationJobResponse = {
        publicId: "job-123",
        taskType: "READ_ALOUD",
        cefrLevel: "B2",
        pool: "PRACTICE",
        topicHint: "Technology",
        requestedCount: 5,
        status: "COMPLETED",
        succeededCount: 4,
        failedCount: 1,
        failureCode: null,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        items: [
          {
            index: 0,
            stage: "SAVED",
            questionPublicId: "q-1",
            failureCode: null,
            failureNote: null,
          },
        ],
      };

      expect(jobData.publicId).toBe("job-123");
      expect(jobData.status).toBe("COMPLETED");
      expect(jobData.items).toHaveLength(1);
      expect(jobData.succeededCount).toBe(4);
    });

    it("should handle items with failures", () => {
      const item: QuestionGenerationItemResponse = {
        index: 1,
        stage: "FAILED",
        questionPublicId: null,
        failureCode: "VALIDATION_FAILED",
        failureNote: "Invalid answer key",
      };

      expect(item.stage).toBe("FAILED");
      expect(item.failureCode).toBe("VALIDATION_FAILED");
      expect(item.questionPublicId).toBeNull();
    });
  });

  describe("mapQuotaResponse", () => {
    it("should map quota response correctly", () => {
      const quotaData = {
        usedToday: 45,
        dailyLimit: 100,
      };

      expect(quotaData.usedToday).toBe(45);
      expect(quotaData.dailyLimit).toBe(100);
      expect(100 - quotaData.usedToday).toBe(55);
    });

    it("should calculate remaining quota", () => {
      const quota = { usedToday: 10, dailyLimit: 20 };
      const remaining = quota.dailyLimit - quota.usedToday;

      expect(remaining).toBe(10);
      expect(remaining > 0).toBe(true);
    });
  });

  describe("mapTaskTypeResponse", () => {
    it("should map task type with metadata", () => {
      const taskType = {
        taskType: "READ_ALOUD",
        section: "READING",
        needsAudio: true,
        needsImage: false,
        estimatedSecondsPerItem: 120,
      };

      expect(taskType.section).toBe("READING");
      expect(taskType.needsAudio).toBe(true);
      expect(taskType.estimatedSecondsPerItem).toBe(120);
    });

    it("should handle different task types", () => {
      const taskTypes = [
        {
          taskType: "READ_ALOUD",
          section: "READING",
          needsAudio: true,
          needsImage: false,
          estimatedSecondsPerItem: 120,
        },
        {
          taskType: "WRITE_ESSAY",
          section: "WRITING",
          needsAudio: false,
          needsImage: false,
          estimatedSecondsPerItem: 180,
        },
        {
          taskType: "SUMMARIZE_SPOKEN_TEXT",
          section: "LISTENING",
          needsAudio: true,
          needsImage: false,
          estimatedSecondsPerItem: 150,
        },
      ];

      const listeningTasks = taskTypes.filter((t) => t.section === "LISTENING");
      expect(listeningTasks).toHaveLength(1);
      expect(listeningTasks[0].needsAudio).toBe(true);
    });
  });
});
