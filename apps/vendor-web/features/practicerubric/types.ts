import type { PracticeRubricResponse } from "@pte/api-client";

export interface RubricLevelDraft {
  key: string;
  labelVi: string;
  labelEn: string;
  descriptor: string;
}

export interface RubricCriterionDraft {
  criterionId: string;
  order: number;
  required: boolean;
  applicability: string;
  allowedLevels: string[];
  evidencePolicy: {
    requiredTypes: string[];
    allowNotAssessable: boolean;
    minimumCoverage: string;
  };
  levels: RubricLevelDraft[];
}

export interface RubricDocumentDraft {
  schemaVersion: string;
  rubricKey: string;
  channel: "PRACTICE";
  revision: number;
  taskTypeKey: string;
  runtime: {
    profileKey: string;
    profileVersion: number;
    behaviorKey: string;
    rendererKey: string;
    answerSchemaVersion: number;
    scoringProfileKey: string;
    scoringProfileVersion: number;
    requiredClientCapabilities: string[];
    screenKey: string;
    contractVersion: number;
    scoringMode: string;
    minSupportedAppVersion: string;
    authoringContractKey: string;
    authoringContractVersion: number;
  };
  criteria: RubricCriterionDraft[];
  policies: {
    emptyResponse: string;
    invalidResponse: string;
    offTopicResponse: string;
    unsupportedNumericScore: string;
    officialScoreClaim: string;
  };
  references: Array<{
    referenceKey: string;
    sourceArtifact: string;
    sourceRevision: string;
    contentHash: string;
  }>;
  anchors: Array<{
    criterionId: string;
    level: string;
    exampleKey: string;
    sanitizedResponse: string;
    evidenceNote: string;
    approvalStatus: string;
  }>;
  provenance: {
    sourceDocument: string;
    sourceRevision: string;
    academicApprovalRequired: boolean;
  };
}

export const TASK_CRITERIA: Record<string, string[]> = {
  PERSONAL_INTRODUCTION: [],
  READ_ALOUD: ["CONTENT_COVERAGE", "PRONUNCIATION", "FLUENCY", "PROSODY"],
  REPEAT_SENTENCE: ["CONTENT_COVERAGE", "PRONUNCIATION", "FLUENCY", "PROSODY"],
  DESCRIBE_IMAGE: ["TASK_FULFILMENT", "CONTENT_COVERAGE", "LANGUAGE_CONTROL", "PRONUNCIATION", "FLUENCY"],
  RE_TELL_LECTURE: ["CONTENT_COVERAGE", "FAITHFULNESS", "LANGUAGE_CONTROL", "PRONUNCIATION", "FLUENCY"],
  ANSWER_SHORT_QUESTION: ["CONTENT_COVERAGE", "PRONUNCIATION", "FLUENCY"],
  RESPOND_TO_A_SITUATION: ["TASK_FULFILMENT", "REGISTER_APPROPRIATENESS", "LANGUAGE_CONTROL", "PRONUNCIATION", "FLUENCY"],
  SUMMARIZE_GROUP_DISCUSSION: ["TASK_FULFILMENT", "CONTENT_COVERAGE", "REGISTER_APPROPRIATENESS", "LANGUAGE_CONTROL", "PRONUNCIATION", "FLUENCY"],
  SUMMARIZE_WRITTEN_TEXT: ["SOURCE_COVERAGE", "FAITHFULNESS", "FORM", "GRAMMAR", "VOCABULARY"],
  WRITE_ESSAY: ["TASK_FULFILMENT", "DEVELOPMENT_SUPPORT", "ORGANIZATION_COHERENCE", "GRAMMAR", "VOCABULARY", "SPELLING", "FORM"],
  MC_READING_SINGLE: ["ANSWER_MATCH"],
  MC_READING_MULTIPLE: ["ANSWER_SET"],
  RE_ORDER_PARAGRAPHS: ["SEQUENCE_RELATION"],
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: ["BLANK_MATCH"],
  FILL_IN_THE_BLANKS_DROPDOWN: ["BLANK_MATCH"],
  SUMMARIZE_SPOKEN_TEXT: ["SOURCE_COVERAGE", "FAITHFULNESS", "ORGANIZATION_COHERENCE", "GRAMMAR", "VOCABULARY", "SPELLING", "FORM"],
  MC_LISTENING_SINGLE: ["ANSWER_MATCH"],
  MC_LISTENING_MULTIPLE: ["ANSWER_SET"],
  FILL_IN_THE_BLANKS_TYPE_IN: ["TOKEN_MATCH"],
  HIGHLIGHT_CORRECT_SUMMARY: ["SUMMARY_MATCH"],
  SELECT_MISSING_WORD: ["CONTEXT_MATCH"],
  HIGHLIGHT_INCORRECT_WORDS: ["TOKEN_MATCH"],
  WRITE_FROM_DICTATION: ["TOKEN_MATCH"],
};

export const TASK_REQUIRED_EVIDENCE: Record<string, string[]> = {
  PERSONAL_INTRODUCTION: ["PROMPT"],
  READ_ALOUD: ["PROMPT_TEXT", "RESPONSE_AUDIO"],
  REPEAT_SENTENCE: ["SOURCE_AUDIO", "RESPONSE_AUDIO", "RESPONSE_TRANSCRIPT"],
  DESCRIBE_IMAGE: ["IMAGE", "IMAGE_ANNOTATIONS", "RESPONSE_TRANSCRIPT", "RESPONSE_AUDIO"],
  RE_TELL_LECTURE: ["LECTURE_SOURCE", "RESPONSE_TRANSCRIPT", "RESPONSE_AUDIO"],
  ANSWER_SHORT_QUESTION: ["PROMPT_SOURCE", "ACCEPTED_VARIANTS", "RESPONSE_AUDIO", "RESPONSE_TRANSCRIPT"],
  RESPOND_TO_A_SITUATION: ["SITUATION_REQUIREMENTS", "RESPONSE_TRANSCRIPT", "RESPONSE_AUDIO"],
  SUMMARIZE_GROUP_DISCUSSION: ["DISCUSSION_SOURCE", "SPEAKER_EVIDENCE", "RESPONSE_TRANSCRIPT", "RESPONSE_AUDIO"],
  SUMMARIZE_WRITTEN_TEXT: ["PASSAGE", "RESPONSE_TEXT", "FORM_RESULT"],
  WRITE_ESSAY: ["PROMPT", "RESPONSE_TEXT", "FORM_RESULT"],
  MC_READING_SINGLE: ["PASSAGE", "OPTION_SET", "ANSWER_KEY", "DETERMINISTIC_RESULT"],
  MC_READING_MULTIPLE: ["PASSAGE", "OPTION_SET", "ANSWER_KEY", "DETERMINISTIC_RESULT"],
  RE_ORDER_PARAGRAPHS: ["PARAGRAPH_BLOCKS", "ANSWER_ORDER", "DETERMINISTIC_RESULT"],
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: ["PASSAGE", "BLANKS", "WORD_BANK", "ANSWER_KEY", "DETERMINISTIC_RESULT"],
  FILL_IN_THE_BLANKS_DROPDOWN: ["PASSAGE", "BLANK_GROUPS", "OPTION_SET", "ANSWER_KEY", "DETERMINISTIC_RESULT"],
  SUMMARIZE_SPOKEN_TEXT: ["AUDIO", "LECTURE_TRANSCRIPT", "RESPONSE_TEXT", "FORM_RESULT"],
  MC_LISTENING_SINGLE: ["AUDIO", "TRANSCRIPT_OR_SOURCE", "OPTION_SET", "ANSWER_KEY", "DETERMINISTIC_RESULT"],
  MC_LISTENING_MULTIPLE: ["AUDIO", "TRANSCRIPT_OR_SOURCE", "OPTION_SET", "ANSWER_KEY", "DETERMINISTIC_RESULT"],
  FILL_IN_THE_BLANKS_TYPE_IN: ["AUDIO", "PASSAGE", "BLANK_IDS", "NORMALIZATION_POLICY", "ANSWER_KEY"],
  HIGHLIGHT_CORRECT_SUMMARY: ["AUDIO", "SOURCE", "SUMMARY_OPTIONS", "ANSWER_KEY"],
  SELECT_MISSING_WORD: ["AUDIO", "SOURCE", "CANDIDATE_ENDINGS", "ANSWER_KEY"],
  HIGHLIGHT_INCORRECT_WORDS: ["AUDIO", "TRANSCRIPT_TOKENS", "TOKEN_IDS", "ANSWER_KEY"],
  WRITE_FROM_DICTATION: ["AUDIO", "SOURCE_TRANSCRIPT", "NORMALIZATION_POLICY", "ANSWER_KEY"],
};

export const DEFAULT_LEVELS: RubricLevelDraft[] = [
  { key: "NOT_ASSESSABLE", labelVi: "Chưa thể đánh giá", labelEn: "Not assessable", descriptor: "Required evidence is missing or invalid." },
  { key: "NEEDS_SUPPORT", labelVi: "Cần hỗ trợ", labelEn: "Needs support", descriptor: "The response needs focused support." },
  { key: "DEVELOPING", labelVi: "Đang phát triển", labelEn: "Developing", descriptor: "The response shows developing control." },
  { key: "EFFECTIVE", labelVi: "Đạt yêu cầu", labelEn: "Effective", descriptor: "The response meets the learning target." },
  { key: "STRONG", labelVi: "Tốt", labelEn: "Strong", descriptor: "The response consistently demonstrates the target." },
];

const RUNTIME_PROFILES: Record<string, Omit<RubricDocumentDraft["runtime"], "profileKey">> = {
  PERSONAL_INTRODUCTION: { profileVersion: 1, behaviorKey: "PERSONAL_INTRODUCTION", rendererKey: "PERSONAL_INTRODUCTION_V1", answerSchemaVersion: 1, scoringProfileKey: "UNSCORED", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_RECORDING"], screenKey: "PERSONAL_INTRODUCTION_V1", contractVersion: 1, scoringMode: "NONE", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.PERSONAL_INTRODUCTION_AUTHORING", authoringContractVersion: 1 },
  READ_ALOUD: { profileVersion: 1, behaviorKey: "RECORD_RESPONSE", rendererKey: "READ_ALOUD_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_SPEECH", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_RECORDING"], screenKey: "READ_ALOUD_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.READ_ALOUD_AUTHORING", authoringContractVersion: 1 },
  REPEAT_SENTENCE: { profileVersion: 1, behaviorKey: "RECORD_RESPONSE", rendererKey: "REPEAT_SENTENCE_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_SPEECH", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "AUDIO_RECORDING"], screenKey: "REPEAT_SENTENCE_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.REPEAT_SENTENCE_AUTHORING", authoringContractVersion: 1 },
  DESCRIBE_IMAGE: { profileVersion: 1, behaviorKey: "RECORD_RESPONSE", rendererKey: "DESCRIBE_IMAGE_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_SPEECH", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_RECORDING", "IMAGE_DISPLAY"], screenKey: "DESCRIBE_IMAGE_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.DESCRIBE_IMAGE_AUTHORING", authoringContractVersion: 1 },
  RE_TELL_LECTURE: { profileVersion: 1, behaviorKey: "RECORD_RESPONSE", rendererKey: "RE_TELL_LECTURE_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_SPEECH", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "AUDIO_RECORDING"], screenKey: "RE_TELL_LECTURE_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.RE_TELL_LECTURE_AUTHORING", authoringContractVersion: 1 },
  ANSWER_SHORT_QUESTION: { profileVersion: 1, behaviorKey: "RECORD_RESPONSE", rendererKey: "ANSWER_SHORT_QUESTION_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_SPEECH", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "AUDIO_RECORDING"], screenKey: "ANSWER_SHORT_QUESTION_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.ANSWER_SHORT_QUESTION_AUTHORING", authoringContractVersion: 1 },
  RESPOND_TO_A_SITUATION: { profileVersion: 1, behaviorKey: "RECORD_RESPONSE", rendererKey: "RESPOND_TO_A_SITUATION_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_SPEECH", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "AUDIO_RECORDING"], screenKey: "RESPOND_TO_A_SITUATION_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.RESPOND_TO_A_SITUATION_AUTHORING", authoringContractVersion: 1 },
  SUMMARIZE_GROUP_DISCUSSION: { profileVersion: 1, behaviorKey: "RECORD_RESPONSE", rendererKey: "SUMMARIZE_GROUP_DISCUSSION_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_SPEECH", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "AUDIO_RECORDING"], screenKey: "SUMMARIZE_GROUP_DISCUSSION_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.SUMMARIZE_GROUP_DISCUSSION_AUTHORING", authoringContractVersion: 1 },
  SUMMARIZE_WRITTEN_TEXT: { profileVersion: 1, behaviorKey: "TEXT_RESPONSE", rendererKey: "SUMMARIZE_WRITTEN_TEXT_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_TEXT", scoringProfileVersion: 1, requiredClientCapabilities: ["TEXT_INPUT"], screenKey: "SUMMARIZE_WRITTEN_TEXT_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.SUMMARIZE_WRITTEN_TEXT_AUTHORING", authoringContractVersion: 1 },
  WRITE_ESSAY: { profileVersion: 1, behaviorKey: "TEXT_RESPONSE", rendererKey: "WRITE_ESSAY_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_TEXT", scoringProfileVersion: 1, requiredClientCapabilities: ["TEXT_INPUT"], screenKey: "WRITE_ESSAY_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.WRITE_ESSAY_AUTHORING", authoringContractVersion: 1 },
  MC_READING_SINGLE: { profileVersion: 1, behaviorKey: "SELECT_OPTION", rendererKey: "MC_READING_SINGLE_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["OPTION_SELECTION"], screenKey: "MC_READING_SINGLE_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.MC_READING_SINGLE_AUTHORING", authoringContractVersion: 1 },
  MC_READING_MULTIPLE: { profileVersion: 1, behaviorKey: "SELECT_OPTIONS", rendererKey: "MC_READING_MULTIPLE_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["OPTION_SELECTION"], screenKey: "MC_READING_MULTIPLE_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.MC_READING_MULTIPLE_AUTHORING", authoringContractVersion: 1 },
  RE_ORDER_PARAGRAPHS: { profileVersion: 1, behaviorKey: "ORDER_OPTIONS", rendererKey: "RE_ORDER_PARAGRAPHS_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["DRAG_AND_DROP"], screenKey: "RE_ORDER_PARAGRAPHS_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.RE_ORDER_PARAGRAPHS_AUTHORING", authoringContractVersion: 1 },
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: { profileVersion: 1, behaviorKey: "FILL_BLANKS", rendererKey: "FILL_IN_THE_BLANKS_DRAG_AND_DROP_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["DRAG_AND_DROP"], screenKey: "FILL_IN_THE_BLANKS_DRAG_AND_DROP_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.FILL_IN_THE_BLANKS_DRAG_AND_DROP_AUTHORING", authoringContractVersion: 1 },
  FILL_IN_THE_BLANKS_DROPDOWN: { profileVersion: 1, behaviorKey: "FILL_BLANKS", rendererKey: "FILL_IN_THE_BLANKS_DROPDOWN_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["DROPDOWN_SELECTION"], screenKey: "FILL_IN_THE_BLANKS_DROPDOWN_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.FILL_IN_THE_BLANKS_DROPDOWN_AUTHORING", authoringContractVersion: 1 },
  SUMMARIZE_SPOKEN_TEXT: { profileVersion: 1, behaviorKey: "TEXT_RESPONSE", rendererKey: "SUMMARIZE_SPOKEN_TEXT_V1", answerSchemaVersion: 1, scoringProfileKey: "AI_TEXT", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "TEXT_INPUT"], screenKey: "SUMMARIZE_SPOKEN_TEXT_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.SUMMARIZE_SPOKEN_TEXT_AUTHORING", authoringContractVersion: 1 },
  MC_LISTENING_SINGLE: { profileVersion: 1, behaviorKey: "SELECT_OPTION", rendererKey: "MC_LISTENING_SINGLE_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "OPTION_SELECTION"], screenKey: "MC_LISTENING_SINGLE_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.MC_LISTENING_SINGLE_AUTHORING", authoringContractVersion: 1 },
  MC_LISTENING_MULTIPLE: { profileVersion: 1, behaviorKey: "SELECT_OPTIONS", rendererKey: "MC_LISTENING_MULTIPLE_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "OPTION_SELECTION"], screenKey: "MC_LISTENING_MULTIPLE_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.MC_LISTENING_MULTIPLE_AUTHORING", authoringContractVersion: 1 },
  FILL_IN_THE_BLANKS_TYPE_IN: { profileVersion: 1, behaviorKey: "TEXT_RESPONSE", rendererKey: "FILL_IN_THE_BLANKS_TYPE_IN_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "TEXT_INPUT"], screenKey: "FILL_IN_THE_BLANKS_TYPE_IN_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.FILL_IN_THE_BLANKS_TYPE_IN_AUTHORING", authoringContractVersion: 1 },
  HIGHLIGHT_CORRECT_SUMMARY: { profileVersion: 1, behaviorKey: "HIGHLIGHT_OPTIONS", rendererKey: "HIGHLIGHT_CORRECT_SUMMARY_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "HIGHLIGHT_SELECTION"], screenKey: "HIGHLIGHT_CORRECT_SUMMARY_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.HIGHLIGHT_CORRECT_SUMMARY_AUTHORING", authoringContractVersion: 1 },
  SELECT_MISSING_WORD: { profileVersion: 1, behaviorKey: "SELECT_OPTION", rendererKey: "SELECT_MISSING_WORD_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "OPTION_SELECTION"], screenKey: "SELECT_MISSING_WORD_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.SELECT_MISSING_WORD_AUTHORING", authoringContractVersion: 1 },
  HIGHLIGHT_INCORRECT_WORDS: { profileVersion: 1, behaviorKey: "HIGHLIGHT_TEXT", rendererKey: "HIGHLIGHT_INCORRECT_WORDS_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "HIGHLIGHT_SELECTION"], screenKey: "HIGHLIGHT_INCORRECT_WORDS_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.HIGHLIGHT_INCORRECT_WORDS_AUTHORING", authoringContractVersion: 1 },
  WRITE_FROM_DICTATION: { profileVersion: 1, behaviorKey: "TEXT_RESPONSE", rendererKey: "WRITE_FROM_DICTATION_V1", answerSchemaVersion: 1, scoringProfileKey: "OBJECTIVE", scoringProfileVersion: 1, requiredClientCapabilities: ["AUDIO_PLAYBACK", "TEXT_INPUT"], screenKey: "WRITE_FROM_DICTATION_V1", contractVersion: 1, scoringMode: "SCORED", minSupportedAppVersion: "1.0.0", authoringContractKey: "PTE.WRITE_FROM_DICTATION_AUTHORING", authoringContractVersion: 1 },
};

export function createRubricDocument(taskTypeKey: string, rubricKey: string, revision = 1): RubricDocumentDraft {
  const criteria = (TASK_CRITERIA[taskTypeKey] ?? []).map((criterionId, index) => ({
    criterionId,
    order: index + 1,
    required: true,
    applicability: "ALWAYS",
    allowedLevels: DEFAULT_LEVELS.map((level) => level.key),
    evidencePolicy: { requiredTypes: [...(TASK_REQUIRED_EVIDENCE[taskTypeKey] ?? ["RESPONSE"])], allowNotAssessable: true, minimumCoverage: "LIMITED" },
    levels: DEFAULT_LEVELS.map((level) => ({ ...level })),
  }));
  return {
    schemaVersion: "1.0",
    rubricKey,
    channel: "PRACTICE",
    revision,
    taskTypeKey,
    runtime: { profileKey: `PTE.${taskTypeKey}`, ...(RUNTIME_PROFILES[taskTypeKey] ?? RUNTIME_PROFILES.WRITE_ESSAY) },
    criteria,
    policies: {
      emptyResponse: "return_not_assessable_without_inference",
      invalidResponse: "return_not_assessable_and_explain_input_issue",
      offTopicResponse: "use_task_specific_policy_and_quote_only_verified_evidence",
      unsupportedNumericScore: "reject",
      officialScoreClaim: "reject",
    },
    references: [{ referenceKey: "PTEPREP-RUBRIC-SOURCE", sourceArtifact: "practice-rubric-v1.md", sourceRevision: "1.0", contentHash: "c8c2764deab99d7a1fc1d6ada5bf2a63361b527e837cc55f99f82ed501a891f1" }],
    anchors: [],
    provenance: { sourceDocument: "practice-rubric-v1.md", sourceRevision: "1.0", academicApprovalRequired: true },
  };
}

export function parseRubricDocument(response: PracticeRubricResponse): RubricDocumentDraft {
  const parsed = JSON.parse(response.documentJson) as Partial<RubricDocumentDraft>;
  return {
    ...createRubricDocument(response.taskTypeKey, response.rubricKey, response.version),
    ...parsed,
    runtime: { ...createRubricDocument(response.taskTypeKey, response.rubricKey).runtime, ...(parsed.runtime ?? {}) },
    criteria: (parsed.criteria as RubricCriterionDraft[] | undefined) ?? [],
    references: parsed.references ?? [],
    anchors: parsed.anchors ?? [],
    policies: { ...createRubricDocument(response.taskTypeKey, response.rubricKey).policies, ...(parsed.policies ?? {}) },
    provenance: parsed.provenance ?? { sourceDocument: "", sourceRevision: "", academicApprovalRequired: true },
  };
}

export function serializeRubricDocument(document: RubricDocumentDraft): string {
  return JSON.stringify(document);
}
