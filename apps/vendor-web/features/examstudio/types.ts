import type { QuestionTypeResponse, ScoreTemplateItemResponse } from "@pte/api-client";

export type StudioTileState = "ready" | "short" | "missing" | "outside";

/** One task type of the catalog, with where it stands in the working template. */
export interface StudioTile {
  key: string;
  type: QuestionTypeResponse;
  /** The template row of this task type; null when the template does not hold it. */
  item: ScoreTemplateItemResponse | null;
  required: number;
  available: number;
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

export type StudioTab = "coverage" | "kanban" | "compose" | "timeline";
