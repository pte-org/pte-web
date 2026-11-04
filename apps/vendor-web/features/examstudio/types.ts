import type { QuestionTypeResponse, ScoreTemplateItemResponse } from "@pte/api-client";

export type StudioTileState = "ready" | "short" | "missing" | "outside";

/** One task type of the catalog, with where it stands in the working template. */
export interface StudioTile {
  key: string;
  type: QuestionTypeResponse;
  /** The template row of this task type; null when the template does not hold it. */
  item: ScoreTemplateItemResponse | null;
  /** Questions one exam needs of this task type; 0 when the template does not hold it. */
  required: number;
  available: number;
  /** How many exams the approved questions can fill without repeating one; null when none needs it. */
  distinctExams: number | null;
  state: StudioTileState;
}

export interface StudioModel {
  tiles: StudioTile[];
  readyCount: number;
  totalCount: number;
  missingQuestions: number;
  outsideCount: number;
  isReady: boolean;
}

/** A task type that does not have the questions an exam needs yet. */
export interface StudioGap {
  tile: StudioTile;
  missing: number;
}

export type StudioTab = "coverage" | "kanban" | "compose" | "timeline";

/** The kind of content the hub is following. */
export type StudioKind = "questions" | "taskTypes" | "templates";
