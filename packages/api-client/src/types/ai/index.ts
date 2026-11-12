/** Read-only AI administration (com.pte.itembank.internal.generation.controller.AiAdminController). */

export interface AiStatusLimits {
  maxItemsPerJob: number;
  maxItemsPerUserPerDay: number;
  maxItemsPerDayGlobal: number;
  maxConcurrentJobs: number;
  maxCallsPerItem: number;
}

/** Configuration without any secret: a key is reported as present or not, a provider by its host. */
export interface AiStatusResponse {
  generationEnabled: boolean;
  generatorModel: string;
  reviewerModel: string;
  providerHost: string;
  /** The provider's web page (no user info or query); empty when not configured. */
  providerWebUrl: string;
  providerKeyConfigured: boolean;
  speechHost: string;
  /** The speech service's web page (no user info or query); empty when not configured. */
  speechWebUrl: string;
  speechKeyConfigured: boolean;
  promptVersion: number;
  supportedTaskTypes: number;
  limits: AiStatusLimits;
}

export type PromptCategory = "GENERATION" | "REVIEW" | "SCORING" | "SHARED" | "CHATBOT";

/** FIELDS holds the rows of a JSON reply, each "name: example value"; the text sent is the JSON they make. */
export type PromptBlockType = "TEXT" | "LIST" | "CODE" | "LEVELS" | "FIELDS";

export interface PromptLevelRow {
  level: number;
  text: string;
}

export interface PromptBlock {
  type: PromptBlockType;
  /** A small heading above the block; the trait name for a LEVELS block. May be empty. */
  label: string;
  text: string;
  items: string[];
  levels: PromptLevelRow[];
  /** False for reference material the model never receives. */
  sentToAi: boolean;
}

export interface PromptSection {
  /** Stable id, so a page can show it in the user's language. */
  id: string;
  title: string;
  /** Wording that fixes the reply format; not meant to be edited. */
  locked: boolean;
  blocks: PromptBlock[];
}

export interface PromptDocument {
  category: PromptCategory;
  key: string;
  title: string;
  sections: PromptSection[];
  /** The text the model receives; empty when no model is sent a prompt for this entry. */
  assembledText: string;
}

export interface PromptSummary {
  category: PromptCategory;
  key: string;
  title: string;
  /** Skills, or the engines (GEMINI, AZURE, CODE) that do the scoring. */
  tags: string[];
}

export interface PromptCategoryEntries {
  category: PromptCategory;
  entries: PromptSummary[];
}

export interface PromptCatalogResponse {
  promptVersion: number;
  categories: PromptCategoryEntries[];
}

export interface GenerationTaskTypeStats {
  taskType: string;
  saved: number;
  failed: number;
}

export interface GenerationFailureStats {
  code: string;
  count: number;
}

export interface GenerationStatsResponse {
  days: number;
  saved: number;
  failed: number;
  /** Items the reviewer refused after the one rewrite. */
  reviewRejected: number;
  byTaskType: GenerationTaskTypeStats[];
  failures: GenerationFailureStats[];
  /** Provider calls of generation and review in the period and the tokens they used. */
  tokens?: GenerationTokenStats;
}

export interface GenerationTokenStats {
  calls: number;
  tokensIn: number;
  tokensOut: number;
  /** At the configured prices; an estimate, like the chatbot cost. */
  estimatedCostUsd: number;
}

export type PromptVersionStatus = "DRAFT" | "PENDING" | "ACTIVE" | "REJECTED" | "RETIRED";

/** A section of an editable prompt (no lock: every part can be edited). */
export interface PromptContentSection {
  id: string;
  title: string;
  blocks: PromptBlock[];
}

/** An editable prompt: a title, the blocks before the first heading, and titled sections. */
export interface PromptContent {
  title: string;
  intro: PromptBlock[];
  sections: PromptContentSection[];
}

/** The last test of a version; `current` is false when the content changed after the test ran. */
export interface PromptTestInfo {
  passed: boolean;
  current: boolean;
  note: string | null;
  testedAt: string;
  testedByName: string | null;
}

export interface PromptVersionSummary {
  publicId: string;
  versionNo: number;
  status: PromptVersionStatus;
  authorName: string | null;
  approverName: string | null;
  createdAt: string;
  submittedAt: string | null;
  activatedAt: string | null;
  testPassed: boolean;
}

export interface PromptVersionResponse {
  publicId: string;
  category: PromptCategory;
  key: string;
  versionNo: number;
  status: PromptVersionStatus;
  content: PromptContent;
  /** The text the model would receive from this content. */
  assembledText: string;
  placeholders: string[];
  authorName: string | null;
  authorUserPublicId: string | null;
  approverName: string | null;
  rejectionReason: string | null;
  createdAt: string;
  submittedAt: string | null;
  decidedAt: string | null;
  activatedAt: string | null;
  /** Sent back when saving so a change made by someone else is not overwritten. */
  lockVersion: number;
  test: PromptTestInfo | null;
}

/** Starts the prompt's proposal for changes, or replaces the content of the open one. */
export interface PromptProposalRequest {
  content: PromptContent;
  /** The lock version of the open proposal as loaded; omit when there is none yet. */
  expectedLockVersion?: number;
}

/** What the prompt page shows: the version in use, the open proposal (null when none) and the accepted changes. */
export interface PromptWorkspaceResponse {
  live: PromptVersionResponse;
  proposal: PromptVersionResponse | null;
  history: PromptVersionSummary[];
  /** Sections the system depends on: shown read-only, and the server refuses a proposal that changes them. */
  lockedSectionIds?: string[];
}

export interface PromptStatusRequest {
  action: "SUBMIT" | "APPROVE" | "REJECT" | "DISCARD";
  reason?: string;
}

export interface PromptTestResponse {
  passed: boolean;
  note: string;
  /** What the model wrote for the test, cut to a few thousand characters. */
  sampleOutput: string;
  testedAt: string;
}
