/**
 * English messages for question generation feature
 * All user-facing strings are centralized here per CODING_STANDARDS_WEB.md
 */
export const generationMessages = {
  // Feature flag & permissions
  featureDisabled: "Question generation is currently disabled",
  featureDisabledTooltip:
    "Question generation is temporarily unavailable. Please try again later.",
  permissionDenied: "You don't have permission to generate questions",

  // Drawer: Header
  drawerTitle: "Generate Questions with AI",
  drawerDescription: "Create high-quality questions automatically",

  // Drawer: Form Steps
  skillLabel: "Skill",
  taskTypeLabel: "Task Type",
  cefrLevelLabel: "CEFR Level",
  poolLabel: "Pool",
  topicLabel: "Topic (Optional)",
  countLabel: "Number of Questions",
  topicPlaceholder: "e.g., Technology, Environment, Education",
  topicHint: "Maximum 200 characters",

  // Skills
  skillSpeaking: "Speaking",
  skillWriting: "Writing",
  skillReading: "Reading",
  skillListening: "Listening",

  // Pools
  poolPractice: "Practice",
  poolExam: "Exam",

  // CEFR Levels
  cefrB1: "B1",
  cefrB2: "B2 (Default)",
  cefrC1: "C1",
  cefrC2: "C2",

  // Form validation
  skillRequired: "Please select a skill",
  taskTypeRequired: "Please select a task type",
  cefrLevelRequired: "Please select a CEFR level",
  poolRequired: "Please select a pool",
  countInvalid: "Please enter a number between 1 and 10",
  topicTooLong: "Topic cannot exceed 200 characters",

  // Info panel
  estimatedTimePerQuestion: "≈ 1–2 minutes per question",
  quotaLabel: "Daily Quota",
  quotaWarning: "{used}/{limit} questions used today",
  quotaExceeded: "Daily limit exceeded. You can generate {remaining} more question(s) today.",

  // Form actions
  cancelButton: "Cancel",
  startButton: "Start Generation",
  startingGenerationMessage: "Starting question generation...",

  // Progress tray
  generatingTitle: "Generating",
  generationProgressLabel: "{completed}/{total}",
  successCount: "{count} ✓",
  failureCount: "{count} ✗",
  expandButton: "Expand",
  collapseButton: "Collapse",
  cancelGenerationButton: "Cancel",
  reviewQuestionsButton: "Review {count} questions →",

  // Progress steps
  stepQueued: "Queued",
  stepGenerating: "Writing",
  stepValidating: "Validating",
  stepReviewing: "Reviewing",
  stepRenderingMedia: "Rendering media",
  stepSaved: "Saved",
  stepFailed: "Failed",

  // Failure codes & reasons
  failureReasonValidation: "Validation failed",
  failureReasonReview: "Reviewer rejected this question",
  failureReasonMedia: "Media rendering failed",
  failureReasonProvider: "AI provider error",
  failureReasonQuota: "Quota exceeded",
  failureReasonUnknown: "Unknown error",

  // Failure code translations (from backend)
  failureCodeValidationFailed: "Validation failed",
  failureCodeReviewFailed: "Review check failed",
  failureCodeMediaRenderingFailed: "Media rendering failed",
  failureCodeAiProviderError: "AI provider error",
  failureCodeQuotaExceeded: "Quota exceeded",

  // Cancel confirmation
  cancelConfirmTitle: "Cancel Generation?",
  cancelConfirmMessage: "This will stop the generation process. Questions that have not been saved will be lost.",
  cancelConfirmButton: "Cancel Generation",
  cancelCancelButton: "Continue",

  // Review page
  reviewPageTitle: "Review Generated Questions",
  reviewPageDescription: "Review each question before adding to the question bank",

  // Review page: List
  questionIndexLabel: "#",
  questionTopicLabel: "Topic",
  questionVerdictLabel: "Status",
  verdictPass: "Pass",
  verdictFail: "Fail",

  // Review page: Preview tab
  previewTabLabel: "Preview",
  previewLoadingMessage: "Loading question preview...",
  previewErrorMessage: "Unable to load preview",
  missingMediaNote: "Media not yet generated",

  // Review page: Review AI tab
  reviewAiTabLabel: "Review AI",
  reviewCheckTitle: "AI Checks",
  checkTaskFidelity: "Task Fidelity",
  checkCefrFit: "CEFR Fit",
  checkAnswerKey: "Answer Key",
  checkScorability: "Scorability",
  checkClarity: "Clarity",
  checkSafety: "Safety",
  checkOk: "✓ Pass",
  checkFailed: "✗ Failed",
  reviewNotesLabel: "Review Notes",
  verdictLabel: "Verdict",
  estimatedCefrLabel: "Estimated CEFR",
  fixSuggestionLabel: "Fix Suggestion",
  metricsLabel: "Metrics (Reference Only)",
  keyPointsLabel: "Key Points",
  mediaInfoLabel: "Media",

  // Review page: Edit tab
  editTabLabel: "Edit",

  // Review page: Actions
  submitButton: "Submit",
  editButton: "Edit",
  deleteButton: "Delete",
  deleteConfirmTitle: "Delete Question?",
  deleteConfirmMessage: "This action cannot be undone.",

  // Review page: Bulk actions
  bulkSubmitAllLabel: "Submit all passing questions",
  bulkSubmitAllDescription: "This will submit {count} question(s) for approval",
  bulkSubmitAllConfirmMessage: "Submit {count} passing question(s)?",
  bulkDeleteLabel: "Delete selected drafts",
  bulkDeleteDescription: "This will permanently delete {count} question(s)",
  bulkDeleteConfirmMessage: "Delete {count} question(s)? This cannot be undone.",
  noBulkSelectableQuestions: "No passing questions to submit",

  // Review page: Keyboard shortcuts
  shortcutNavigateUp: "Press ↑ to go to previous question",
  shortcutNavigateDown: "Press ↓ to go to next question",
  shortcutNavigateHint: "Use arrow keys to navigate when the question list is focused",

  // States
  emptyStateTitle: "No generation runs yet",
  emptyStateDescription: "Create your first set of questions using the \"Generate with AI\" button",
  emptyStateButtonLabel: "Create Questions",

  // Questions list integration
  aiGeneratedBadge: "AI created",
  filterAll: "All",
  filterAiGenerated: "AI created",
  filterManual: "Manual",

  // Errors
  jobNotFound: "Generation job not found",
  jobError: "An error occurred while fetching the job",
  quotaLoadError: "Unable to load quota information",
  taskTypesLoadError: "Unable to load available task types",
  fetchQuestionsError: "Unable to load questions",
} as const;
