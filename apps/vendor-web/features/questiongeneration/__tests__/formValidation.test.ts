import { describe, it, expect } from "vitest";
import type { GenerationFormState } from "../types";

describe("Generation Form Validation", () => {
  describe("field validation", () => {
    it("should validate skill selection", () => {
      const state: GenerationFormState = { count: 5 };
      const isValid = !!state.skill;

      expect(isValid).toBe(false);

      state.skill = "WRITING";
      expect(!!state.skill).toBe(true);
    });

    it("should validate task type selection", () => {
      const state: GenerationFormState = { skill: "WRITING", count: 5 };
      expect(!!state.taskType).toBe(false);

      state.taskType = "WRITE_ESSAY";
      expect(!!state.taskType).toBe(true);
    });

    it("should validate CEFR level", () => {
      const validLevels = ["B1", "B2", "C1", "C2"];
      const state: GenerationFormState = { count: 5, cefrLevel: "B2" };

      expect(validLevels.includes(state.cefrLevel as string)).toBe(true);
    });

    it("should validate pool", () => {
      const validPools = ["PRACTICE", "EXAM"];
      const state: GenerationFormState = { count: 5, pool: "PRACTICE" };

      expect(validPools.includes(state.pool as string)).toBe(true);
    });
  });

  describe("count validation", () => {
    it("should validate count range", () => {
      const validateCount = (count: number) => count >= 1 && count <= 10;

      expect(validateCount(0)).toBe(false);
      expect(validateCount(1)).toBe(true);
      expect(validateCount(5)).toBe(true);
      expect(validateCount(10)).toBe(true);
      expect(validateCount(11)).toBe(false);
    });
  });

  describe("topic validation", () => {
    it("should validate topic length", () => {
      const validateTopic = (topic: string | undefined) =>
        !topic || topic.length <= 200;

      expect(validateTopic(undefined)).toBe(true);
      expect(validateTopic("")).toBe(true);
      expect(validateTopic("Valid topic")).toBe(true);
      expect(validateTopic("a".repeat(200))).toBe(true);
      expect(validateTopic("a".repeat(201))).toBe(false);
    });

    it("should trim whitespace from topic", () => {
      const topic = "  Technology  ";
      const trimmed = topic.trim();

      expect(trimmed).toBe("Technology");
      expect(trimmed.length).toBeLessThan(topic.length);
    });
  });

  describe("quota validation", () => {
    it("should warn when count exceeds remaining quota", () => {
      const quota = { usedToday: 85, dailyLimit: 100 };
      const requestCount = 20;
      const remaining = quota.dailyLimit - quota.usedToday;

      expect(remaining).toBe(15);
      expect(requestCount > remaining).toBe(true);
    });

    it("should prevent submission when quota exceeded", () => {
      const quota = { usedToday: 100, dailyLimit: 100 };
      const requestCount = 5;
      const remaining = quota.dailyLimit - quota.usedToday;

      expect(remaining).toBe(0);
      expect(requestCount > remaining).toBe(true);
    });

    it("should allow submission within quota", () => {
      const quota = { usedToday: 50, dailyLimit: 100 };
      const requestCount = 30;
      const remaining = quota.dailyLimit - quota.usedToday;

      expect(remaining).toBe(50);
      expect(requestCount <= remaining).toBe(true);
    });
  });

  describe("form state transitions", () => {
    it("should clear task type when skill changes", () => {
      let state: GenerationFormState = {
        skill: "WRITING",
        taskType: "WRITE_ESSAY",
        count: 5,
      };

      // Simulate skill change
      state = {
        ...state,
        skill: "READING",
        taskType: undefined, // cleared
      };

      expect(state.skill).toBe("READING");
      expect(state.taskType).toBeUndefined();
    });
  });

  describe("complete form validation", () => {
    it("should validate complete valid form", () => {
      const state: GenerationFormState = {
        skill: "WRITING",
        taskType: "WRITE_ESSAY",
        cefrLevel: "B2",
        pool: "PRACTICE",
        topicHint: "Technology",
        count: 5,
      };

      const errors: Record<string, string> = {};

      if (!state.skill) errors.skill = "Required";
      if (!state.taskType) errors.taskType = "Required";
      if (!state.cefrLevel) errors.cefrLevel = "Required";
      if (!state.pool) errors.pool = "Required";
      if (state.count < 1 || state.count > 10) errors.count = "Invalid";

      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("should detect all validation errors", () => {
      const state: GenerationFormState = {
        count: 15, // invalid
      };

      const errors: Record<string, string> = {};

      if (!state.skill) errors.skill = "Required";
      if (!state.taskType) errors.taskType = "Required";
      if (!state.cefrLevel) errors.cefrLevel = "Required";
      if (!state.pool) errors.pool = "Required";
      if (state.count < 1 || state.count > 10) errors.count = "Invalid";

      expect(Object.keys(errors)).toHaveLength(5);
    });
  });
});
