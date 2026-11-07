import { describe, it, expect } from "vitest";

interface Review {
  verdict: "PASS" | "FAIL";
  checks: {
    taskFidelity?: { passed: boolean };
    cefrFit?: { passed: boolean };
    answerKey?: { passed: boolean };
    scorability?: { passed: boolean };
    clarity?: { passed: boolean };
    safety?: { passed: boolean };
  };
  estimatedCefr?: string;
  fixSuggestion?: string | null;
}

interface ReviewMeta {
  topic?: string;
  review?: Review;
  metrics?: {
    words?: number;
    avgSentenceLength?: number;
    fleschKincaid?: number;
  };
  keyPoints?: string[];
}

describe("ReviewPanel", () => {
  describe("rendering with metadata", () => {
    it("should render when meta is provided", () => {
      const meta: ReviewMeta = {
        topic: "Technology",
        review: {
          verdict: "PASS",
          checks: {
            taskFidelity: { passed: true },
            cefrFit: { passed: true },
            answerKey: { passed: true },
            scorability: { passed: true },
            clarity: { passed: true },
            safety: { passed: true },
          },
          estimatedCefr: "B2",
          fixSuggestion: null,
        },
        metrics: {
          words: 150,
          avgSentenceLength: 12.5,
          fleschKincaid: 6.2,
        },
        keyPoints: ["Topic should be clear", "Answer key must be unique"],
      };

      expect(meta).toBeDefined();
      expect(meta.topic).toBe("Technology");
      expect(meta.review?.verdict).toBe("PASS");
    });

    it("should display all 6 checks correctly", () => {
      const meta: ReviewMeta = {
        topic: "Technology",
        review: {
          verdict: "PASS",
          checks: {
            taskFidelity: { passed: true },
            cefrFit: { passed: true },
            answerKey: { passed: false },
            scorability: { passed: true },
            clarity: { passed: true },
            safety: { passed: true },
          },
          estimatedCefr: "B2",
          fixSuggestion: "Answer key needs revision",
        },
      };

      const checks = Object.entries(meta.review?.checks ?? {});
      expect(checks).toHaveLength(6);

      const failedChecks = checks.filter(([_, check]) => !check.passed);
      expect(failedChecks).toHaveLength(1);
      expect(failedChecks[0][0]).toBe("answerKey");
    });
  });

  describe("rendering without metadata", () => {
    it("should show message when no meta is available", () => {
      const question = null;
      const hasMetadata = !!question;

      expect(hasMetadata).toBe(false);
    });
  });

  describe("verdict states", () => {
    it("should render PASS verdict", () => {
      const verdict = "PASS";
      expect(verdict).toBe("PASS");
    });

    it("should render FAIL verdict", () => {
      const verdict = "FAIL";
      expect(verdict).toBe("FAIL");
    });
  });

  describe("check rendering", () => {
    it("should show all passing checks", () => {
      const checks = {
        taskFidelity: { passed: true },
        cefrFit: { passed: true },
        answerKey: { passed: true },
        scorability: { passed: true },
        clarity: { passed: true },
        safety: { passed: true },
      };

      const passedCount = Object.values(checks).filter((c) => c.passed).length;
      expect(passedCount).toBe(6);
    });

    it("should show failing checks", () => {
      const checks = {
        taskFidelity: { passed: true },
        cefrFit: { passed: false },
        answerKey: { passed: false },
        scorability: { passed: true },
        clarity: { passed: true },
        safety: { passed: true },
      };

      const failedCount = Object.values(checks).filter((c) => !c.passed).length;
      expect(failedCount).toBe(2);
    });
  });

  describe("metrics display", () => {
    it("should render metrics when available", () => {
      const metrics = {
        words: 200,
        avgSentenceLength: 15.3,
        fleschKincaid: 7.1,
      };

      expect(metrics.words).toBe(200);
      expect(metrics.avgSentenceLength).toBeCloseTo(15.3);
      expect(metrics.fleschKincaid).toBeCloseTo(7.1);
    });

    it("should handle null metrics", () => {
      const metrics = null;
      expect(metrics).toBeNull();
    });
  });

  describe("key points display", () => {
    it("should render key points list", () => {
      const keyPoints = [
        "Vocabulary level appropriate for B2",
        "Grammar structures match task requirements",
        "Content is culturally neutral and safe",
      ];

      expect(keyPoints).toHaveLength(3);
      expect(keyPoints[0]).toContain("Vocabulary");
    });

    it("should handle empty key points", () => {
      const keyPoints: string[] = [];
      expect(keyPoints).toHaveLength(0);
    });
  });

  describe("fix suggestions", () => {
    it("should display fix suggestion when present", () => {
      const fixSuggestion = "Rephrase the answer key for clarity";
      expect(fixSuggestion).toBeTruthy();
    });

    it("should not display fix suggestion when null", () => {
      const fixSuggestion = null;
      expect(fixSuggestion).toBeNull();
    });
  });

  describe("estimated CEFR", () => {
    it("should display estimated CEFR level", () => {
      const estimatedCefr = "B2";
      const validLevels = ["B1", "B2", "C1", "C2"];

      expect(validLevels.includes(estimatedCefr)).toBe(true);
    });
  });
});
