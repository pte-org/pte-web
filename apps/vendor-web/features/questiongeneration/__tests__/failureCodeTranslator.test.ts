import { describe, it, expect } from "vitest";
import { getFailureReasonTranslation } from "../utils/failureCodeTranslator";

describe("failureCodeTranslator", () => {
  describe("provider failure codes", () => {
    it("translates GENERATION_PROVIDER_AUTH", () => {
      const result = getFailureReasonTranslation("GENERATION_PROVIDER_AUTH");
      expect(result).toBe("AI service authentication failed");
    });

    it("translates GENERATION_PROVIDER_UNAVAILABLE", () => {
      const result = getFailureReasonTranslation("GENERATION_PROVIDER_UNAVAILABLE");
      expect(result).toBe("AI service temporarily unavailable");
    });

    it("translates GENERATION_PROVIDER_REJECTED", () => {
      const result = getFailureReasonTranslation("GENERATION_PROVIDER_REJECTED");
      expect(result).toBe("AI service rejected the request");
    });

    it("translates GENERATION_EMPTY_RESPONSE", () => {
      const result = getFailureReasonTranslation("GENERATION_EMPTY_RESPONSE");
      expect(result).toBe("AI service returned empty response");
    });
  });

  describe("item failure codes", () => {
    it("translates GENERATION_ITEMBANK_REJECTED", () => {
      const result = getFailureReasonTranslation("GENERATION_ITEMBANK_REJECTED");
      expect(result).toBe("Question did not meet platform requirements");
    });

    it("translates GENERATION_DUPLICATE_CONTENT", () => {
      const result = getFailureReasonTranslation("GENERATION_DUPLICATE_CONTENT");
      expect(result).toBe("This question already exists in the bank");
    });

    it("translates GENERATION_CALL_BUDGET_EXCEEDED", () => {
      const result = getFailureReasonTranslation("GENERATION_CALL_BUDGET_EXCEEDED");
      expect(result).toBe("Call budget exceeded for this question");
    });

    it("translates GENERATION_SCHEMA_INVALID", () => {
      const result = getFailureReasonTranslation("GENERATION_SCHEMA_INVALID");
      expect(result).toBe("Generated question has invalid structure");
    });

    it("translates GENERATION_VALIDATION_FAILED", () => {
      const result = getFailureReasonTranslation("GENERATION_VALIDATION_FAILED");
      expect(result).toBe("Question failed validation checks");
    });

    it("translates GENERATION_REVIEW_FAILED", () => {
      const result = getFailureReasonTranslation("GENERATION_REVIEW_FAILED");
      expect(result).toBe("AI reviewer rejected this question");
    });

    it("translates GENERATION_REVIEW_PARSING_FAILED", () => {
      const result = getFailureReasonTranslation("GENERATION_REVIEW_PARSING_FAILED");
      expect(result).toBe("Could not parse reviewer feedback");
    });

    it("translates GENERATION_NO_GENERATOR", () => {
      const result = getFailureReasonTranslation("GENERATION_NO_GENERATOR");
      expect(result).toBe("Generator not available for this task type");
    });

    it("translates GENERATION_INTERNAL_ERROR", () => {
      const result = getFailureReasonTranslation("GENERATION_INTERNAL_ERROR");
      expect(result).toBe("Internal error during generation");
    });

    it("translates GENERATION_REQUESTER_NOT_ALLOWED", () => {
      const result = getFailureReasonTranslation("GENERATION_REQUESTER_NOT_ALLOWED");
      expect(result).toBe("You are no longer authorized to create questions");
    });
  });

  describe("unknown codes", () => {
    it("returns 'Unknown error' for unrecognized code", () => {
      const result = getFailureReasonTranslation("UNKNOWN_CODE");
      expect(result).toBe("Unknown error");
    });

    it("returns 'Unknown error' for empty string", () => {
      const result = getFailureReasonTranslation("");
      expect(result).toBe("Unknown error");
    });
  });

  describe("all backend codes are covered", () => {
    it("covers all QuestionGenerationConstants codes", () => {
      const backendCodes = [
        "GENERATION_PROVIDER_AUTH",
        "GENERATION_PROVIDER_UNAVAILABLE",
        "GENERATION_PROVIDER_REJECTED",
        "GENERATION_EMPTY_RESPONSE",
        "GENERATION_ITEMBANK_REJECTED",
        "GENERATION_DUPLICATE_CONTENT",
        "GENERATION_CALL_BUDGET_EXCEEDED",
        "GENERATION_SCHEMA_INVALID",
        "GENERATION_VALIDATION_FAILED",
        "GENERATION_REVIEW_FAILED",
        "GENERATION_REVIEW_PARSING_FAILED",
        "GENERATION_NO_GENERATOR",
        "GENERATION_INTERNAL_ERROR",
        "GENERATION_REQUESTER_NOT_ALLOWED",
      ];

      backendCodes.forEach((code) => {
        const result = getFailureReasonTranslation(code);
        expect(result).not.toBe("Unknown error");
        expect(result).toBeTruthy();
      });
    });
  });
});
