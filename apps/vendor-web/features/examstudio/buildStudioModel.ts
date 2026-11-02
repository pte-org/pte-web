import type {
  QuestionTypeResponse,
  ScoreTemplateFeasibilityResponse,
  ScoreTemplateResponse,
} from "@pte/api-client";
import { taskTypeKeyOf } from "../scoretemplate/addTaskType";
import { STUDIO_SECTIONS, STUDIO_SHORT_RATIO } from "./constants";
import type { StudioModel, StudioTile, StudioTileState } from "./types";

const SECTION_ORDER: readonly string[] = STUDIO_SECTIONS;

function stateOf(hasItem: boolean, required: number, available: number): StudioTileState {
  if (!hasItem) return "outside";
  if (available >= required) return "ready";
  return available >= required * STUDIO_SHORT_RATIO ? "short" : "missing";
}

/** Joins the catalog, the working template and the question coverage into one row per task type. */
export function buildStudioModel(
  template: ScoreTemplateResponse | undefined,
  taskTypes: readonly QuestionTypeResponse[],
  feasibility: ScoreTemplateFeasibilityResponse | undefined,
): StudioModel {
  const itemsByKey = new Map((template?.items ?? []).map((item) => [item.taskTypeKey, item]));
  const availableByKey = new Map(
    (feasibility?.slots ?? []).map((slot) => [slot.taskType, slot.available]),
  );

  const tiles: StudioTile[] = taskTypes
    .filter((type) => type.active && SECTION_ORDER.includes(type.section))
    .map((type) => {
      const key = taskTypeKeyOf(type);
      const item = itemsByKey.get(key) ?? null;
      const required = item?.maxCount ?? 0;
      const available = availableByKey.get(key) ?? 0;
      return { key, type, item, required, available, state: stateOf(item !== null, required, available) };
    })
    .sort(
      (a, b) =>
        SECTION_ORDER.indexOf(a.type.section) - SECTION_ORDER.indexOf(b.type.section) ||
        a.type.displayOrder - b.type.displayOrder,
    );

  const inTemplate = tiles.filter((tile) => tile.item !== null);
  const missingQuestions = inTemplate.reduce(
    (sum, tile) => sum + Math.max(0, tile.required - tile.available),
    0,
  );
  const outsideCount = tiles.length - inTemplate.length;

  return {
    tiles,
    readyCount: tiles.filter((tile) => tile.state === "ready").length,
    totalCount: tiles.length,
    missingQuestions,
    outsideCount,
    isReady: tiles.length > 0 && missingQuestions === 0 && outsideCount === 0,
  };
}
