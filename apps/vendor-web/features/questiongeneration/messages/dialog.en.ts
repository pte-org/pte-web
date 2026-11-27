/** English copy of the AI generation popup; the source of truth for the catalog shape. */
export const dialogMessages = {
  title: "Generate questions with AI",
  poolLabel: "Pool",
  poolPRACTICE: "Practice",
  poolEXAM: "Exam",
  defaultCefrLabel: "Default CEFR level",
  sharedTopicsLabel: "Topics (optional, one per line)",
  sharedTopicsHint: "Used by every task type that has no topics of its own.",

  skillSPEAKING: "Speaking",
  skillWRITING: "Writing",
  skillREADING: "Reading",
  skillLISTENING: "Listening",
  topicsLabel: "Own topics (one per line)",
  taskTypeColumn: "Task type",
  imageKindLabel: "Image type",
  imageKindAUTO: "Auto",
  imageKindCHART: "Chart",
  imageKindPICTURE: "AI picture",
  noTaskTypes: "No task type can be generated right now.",

  matrixStartFrom: "Start from",
  matrixSameAsLast: "Same as last time",
  matrixFillEachCount: "Questions per task type",
  matrixFillEach: "Questions per type: {count}",
  matrixClear: "Clear all",
  matrixUndo: "Undo",
  matrixTotalColumn: "Total",
  matrixSectionSummary: "{types}/{all} task types · {items} questions",
  matrixRowOptions: "Topics and options",
  matrixCellLabel: "{taskType}, {level}",
  matrixEmptyHint: "Type a number in a cell, or start from a shortcut above.",
  sideTotal: "Total questions",
  sideTotalDetail: "{types} task types · ≈ {minutes} min",
  sideDistribution: "CEFR distribution",
  sideBySkill: "By skill",
  mixNote: "Spread by the CEFR mix of template {name} v{version}: {mix}",
  mixSingleLevel: "Use one level",

  presetFull: "Full exam",
  presetMultiplierLabel: "Exams",
  presetSPEAKING: "All Speaking",
  presetWRITING: "All Writing",
  presetREADING: "All Reading",
  presetLISTENING: "All Listening",
  presetOverCap:
    "This preset makes {total} questions, above the batch limit of {cap}. Choose fewer exams.",

  summaryRemaining: "Left today",
  summaryScopeUSER: "your limit",
  summaryScopeGLOBAL: "platform limit",

  problemEMPTY: "Tick at least one task type.",
  problemCOUNT: "Each ticked task type needs at least 1 question.",
  problemSPLIT_EMPTY: "A task type with mixed levels needs at least 1 question in some level.",
  problemTOPICS:
    "Topics: at most 10, up to 500 characters, letters, digits and , . ; : ' ? ! & ( ) / - only.",
  problemOVER_CAP: "The total is above the batch limit of {cap}.",
  problemOVER_QUOTA: "The total is above the {remaining} questions left today.",

  batchDisabled:
    "Generating several questions at once is turned off. You can still generate one question for this form.",
  alreadyRunning:
    "You already have a batch or a generation running. Wait for it to finish or cancel it first.",
  openRunningBatch: "Open the running batch",
  openQuestionBank: "Go to the question bank",

  cancel: "Cancel",
  submitSingle: "Generate 1 question",
  submitBatch: "Start batch ({total} questions)",
  batchStarted: "Batch started.",
  submitError: "The generation could not be started. Please try again.",

  leaveTitle: "Leave this form?",
  leaveDescription: "The batch runs on its own page. What you typed in this form is not saved.",
  leaveConfirm: "Start batch and leave",
  leaveCancel: "Stay here",
} as const;

export type DialogMessages = Readonly<Record<keyof typeof dialogMessages, string>>;
