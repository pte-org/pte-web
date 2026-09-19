import type {
  ImportScoreTemplateRequest,
  ScoreTemplateItemRequest,
  ScoreTemplateResponse,
} from "@pte/api-client";

export interface ScoreTemplateImportDocument extends ImportScoreTemplateRequest {
  sourceStatus?: string;
  sourceVersion?: number;
}

interface UnknownRecord {
  [key: string]: unknown;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const unwrapDocument = (value: unknown): unknown => {
  if (!isRecord(value) || !("data" in value)) return value;
  return value.data;
};

const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${field}.`);
  }
  return value.trim();
};

const numberValue = (value: unknown, field: string): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${field}.`);
  return parsed;
};

const parseItem = (value: unknown, index: number): ScoreTemplateItemRequest => {
  if (!isRecord(value)) throw new Error(`Invalid template item at row ${index + 1}.`);

  return {
    taskType: requiredString(value.taskType, `taskType at row ${index + 1}`),
    section: requiredString(value.section, `section at row ${index + 1}`),
    sequence: numberValue(value.sequence, `sequence at row ${index + 1}`),
    minCount: numberValue(value.minCount, `minCount at row ${index + 1}`),
    maxCount: numberValue(value.maxCount, `maxCount at row ${index + 1}`),
    prepSeconds: numberValue(value.prepSeconds, `prepSeconds at row ${index + 1}`),
    responseSeconds: numberValue(value.responseSeconds, `responseSeconds at row ${index + 1}`),
    timingMode: requiredString(value.timingMode, `timingMode at row ${index + 1}`),
    scoringMethod: requiredString(value.scoringMethod, `scoringMethod at row ${index + 1}`),
    overallWeight: numberValue(value.overallWeight, `overallWeight at row ${index + 1}`),
    speakingWeight: numberValue(value.speakingWeight, `speakingWeight at row ${index + 1}`),
    writingWeight: numberValue(value.writingWeight, `writingWeight at row ${index + 1}`),
    readingWeight: numberValue(value.readingWeight, `readingWeight at row ${index + 1}`),
    listeningWeight: numberValue(value.listeningWeight, `listeningWeight at row ${index + 1}`),
  };
};

/** Accepts one exported template, an API envelope, or a one-element array export. */
export function parseScoreTemplateExport(value: unknown): ScoreTemplateImportDocument {
  const unwrapped = unwrapDocument(value);
  const candidate = Array.isArray(unwrapped) ? unwrapped[0] : unwrapped;
  if (!isRecord(candidate)) throw new Error("The file does not contain a score template object.");

  const rawItems = candidate.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("The score template must contain at least one item.");
  }

  return {
    code: requiredString(candidate.code, "template code"),
    name: requiredString(candidate.name, "template name"),
    items: rawItems.map(parseItem),
    sourceStatus: typeof candidate.status === "string" ? candidate.status : undefined,
    sourceVersion:
      candidate.version === undefined
        ? undefined
        : numberValue(candidate.version, "template version"),
  };
}

export function toScoreTemplateImportRequest(
  document: ScoreTemplateImportDocument,
): ImportScoreTemplateRequest {
  return {
    code: document.code,
    name: document.name,
    items: document.items,
  };
}

export function toQuestionTypeImportItems(document: ScoreTemplateImportDocument): Array<{
  taskType: string;
  section: string;
  sequence: number;
}> {
  return document.items.map(({ taskType, section, sequence }) => ({
    taskType,
    section,
    sequence,
  }));
}

export function downloadScoreTemplateJson(template: ScoreTemplateResponse): void {
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${template.code}-v${template.version}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
