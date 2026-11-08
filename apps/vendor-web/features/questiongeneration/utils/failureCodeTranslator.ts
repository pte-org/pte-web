/**
 * Maps backend failure codes to user-friendly messages
 * Covers EVERY code from QuestionGenerationConstants (phase 3 requirement)
 */
export function getFailureReasonTranslation(failureCode: string): string {
  const translations: Record<string, string> = {
    // Provider failures
    GENERATION_PROVIDER_AUTH: "AI service authentication failed",
    GENERATION_PROVIDER_UNAVAILABLE: "AI service temporarily unavailable",
    GENERATION_PROVIDER_REJECTED: "AI service rejected the request",
    GENERATION_EMPTY_RESPONSE: "AI service returned empty response",

    // Item-level failures
    GENERATION_ITEMBANK_REJECTED: "Question did not meet platform requirements",
    GENERATION_DUPLICATE_CONTENT: "This question already exists in the bank",
    GENERATION_CALL_BUDGET_EXCEEDED: "Call budget exceeded for this question",
    GENERATION_SCHEMA_INVALID: "Generated question has invalid structure",
    GENERATION_VALIDATION_FAILED: "Question failed validation checks",
    GENERATION_REVIEW_FAILED: "AI reviewer rejected this question",
    GENERATION_IMAGE_REVIEW_FAILED: "AI reviewer rejected the chart image",
    GENERATION_REVIEW_PARSING_FAILED: "Could not parse reviewer feedback",
    GENERATION_NO_GENERATOR: "Generator not available for this task type",
    GENERATION_INTERNAL_ERROR: "Internal error during generation",
    GENERATION_REQUESTER_NOT_ALLOWED: "You are no longer authorized to create questions",
  };

  return translations[failureCode] || "Unknown error";
}
