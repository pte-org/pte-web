import type { CreateQuestionRequest, QuestionGenerationLiveItem } from "@pte/api-client";
import type { LiveLane } from "../liveConstants";
import { typedOptions, typedPrompt } from "./livePreviewDraft";
import { lastTopLevelKey } from "./partialJson";

/** One part of a question an agent makes; the student-facing ones are carried onto the exam screen when done. */
export type PieceKey =
  | "prompt"
  | "visual"
  | "options"
  | "audio"
  | "image"
  | "reference"
  | "transcript"
  | "hintVi"
  | "hintEn";

export interface LivePiece {
  key: PieceKey;
  /** The agent that makes it. */
  lane: LiveLane;
  text: string;
  items: string[];
  mediaRef: string | null;
  filled: boolean;
  /** Reviewed (or rendered, for media) and so ready to be placed on the exam screen. */
  ready: boolean;
  studentFacing: boolean;
}

export interface PieceNeeds {
  prompt: boolean;
  options: boolean;
  audio: boolean;
  image: boolean;
  /** The task type keeps an answer key or a reference answer, so its field is shown before it is written. */
  reference: boolean;
}

/** Which piece a key of the writer's raw JSON belongs to. */
const PIECE_OF_KEY: Readonly<Record<string, PieceKey>> = {
  passage: "prompt",
  passageWithSlots: "prompt",
  displayedText: "prompt",
  essayPrompt: "prompt",
  question: "prompt",
  situation: "prompt",
  options: "options",
  correctIndexes: "options",
  topic: "visual",
  title: "visual",
  chartType: "visual",
  xLabel: "visual",
  yLabel: "visual",
  unit: "visual",
  categories: "visual",
  series: "visual",
  imagePrompt: "visual",
  answer: "reference",
  keyPoints: "reference",
  referenceDescription: "reference",
  transcript: "transcript",
  turns: "transcript",
  answerHintVi: "hintVi",
  answerHintEn: "hintEn",
};

/** Stages reached only after the reviewer passed the draft. */
const PASSED_STAGES: readonly string[] = ["RENDERING_MEDIA", "READY", "SAVED"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A value of the raw draft as readable text: a dialogue as "speaker: line" rows, a list joined. */
function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        isRecord(entry) ? Object.values(entry).map(String).join(": ") : String(entry),
      )
      .join("\n");
  }
  return "";
}

const firstText = (typed: unknown, keys: string[]): string =>
  isRecord(typed)
    ? (keys.map((key) => asText(typed[key])).find((text) => text.length > 0) ?? "")
    : "";

/** Keys of the Describe Image draft that make up the picture, read in this order. */
const VISUAL_KEYS = ["title", "chartType", "categories", "series", "imagePrompt"] as const;

/** The data or brief the image is made from (a chart's title, type, categories and series, or a picture's brief). */
function visualText(typed: unknown): string {
  if (!isRecord(typed)) return "";
  return VISUAL_KEYS.map((key) => {
    const value = typed[key];
    // Categories read as one line; a series reads as "name: values".
    return key === "categories" && Array.isArray(value) ? value.join(", ") : asText(value);
  })
    .filter((line) => line.length > 0)
    .join("\n");
}

function textPiece(
  key: PieceKey,
  text: string,
  items: string[],
  ready: boolean,
  studentFacing: boolean,
): LivePiece {
  const filled = text.length > 0 || items.length > 0;
  return {
    key,
    lane: "GENERATOR",
    text,
    items,
    mediaRef: null,
    filled,
    ready: ready && filled,
    studentFacing,
  };
}

/** The pieces of one question at this moment of its generation, in the order the form shows them. */
export function livePieces(
  typed: unknown,
  live: QuestionGenerationLiveItem | undefined,
  needs: PieceNeeds,
): LivePiece[] {
  const fields: Partial<CreateQuestionRequest> | null = live?.draft?.fields ?? null;
  const passed = PASSED_STAGES.includes(live?.stage ?? "") || live?.review?.passed === true;
  const prompt = fields?.promptText ?? typedPrompt(typed);
  const options = fields?.options
    ? fields.options
        .slice()
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .map((option) => option.text)
    : typedOptions(typed);
  const reference =
    fields?.referenceAnswerText ??
    fields?.correctAnswerText ??
    firstText(typed, ["answer", "keyPoints", "referenceDescription"]);
  const hintVi = fields?.answerHintVi ?? firstText(typed, ["answerHintVi"]);
  const hintEn = fields?.answerHintEn ?? firstText(typed, ["answerHintEn"]);
  const visual = needs.image ? visualText(typed) : "";
  const transcript = firstText(typed, ["transcript", "turns"]);
  const pieces: LivePiece[] = [];
  if (needs.prompt || prompt) pieces.push(textPiece("prompt", prompt, [], passed, true));
  if (needs.image) pieces.push(textPiece("visual", visual, [], passed, false));
  if (needs.audio) {
    const ref = live?.audioRef ?? null;
    pieces.push({
      key: "audio",
      lane: "AUDIO",
      text: "",
      items: [],
      mediaRef: ref,
      filled: ref !== null,
      ready: ref !== null,
      studentFacing: true,
    });
  }
  if (needs.image) {
    const ref = live?.imageRef ?? null;
    pieces.push({
      key: "image",
      lane: "IMAGE",
      text: "",
      items: [],
      mediaRef: ref,
      filled: ref !== null,
      ready: ref !== null,
      studentFacing: true,
    });
  }
  if (needs.options || options.length > 0)
    pieces.push(textPiece("options", "", options, passed, true));
  if (needs.reference || reference)
    pieces.push(textPiece("reference", reference, [], passed, false));
  if (transcript) pieces.push(textPiece("transcript", transcript, [], passed, false));
  // Every task type asks the writer for both hints, as the manual form always shows them.
  pieces.push(textPiece("hintVi", hintVi, [], passed, false));
  pieces.push(textPiece("hintEn", hintEn, [], passed, false));
  return pieces;
}

/** What the agent on a piece is doing, which decides the animation shown under it. */
export type PiecePhase = "write" | "validate" | "review" | "media";

export interface ActivePiece {
  key: PieceKey;
  lane: LiveLane;
  phase: PiecePhase;
  /** The media exists already and its making is replayed. */
  replay?: boolean;
  /** The media being replayed, shown as it is revealed. */
  mediaRef?: string | null;
}

/** The filled text piece a checking agent is at, moving on as its share of the work gets done (0 to 1). */
function pieceAt(pieces: LivePiece[], progress: number): LivePiece | undefined {
  const text = pieces.filter((entry) => entry.lane === "GENERATOR" && entry.filled);
  if (text.length === 0) return undefined;
  return text[Math.min(text.length - 1, Math.floor(Math.max(0, progress) * text.length))];
}

/**
 * The piece an agent works on now, so its cursor and animation sit there: the field being typed, the one the
 * validator or reviewer has reached (by `progress`, the share of its checks already done), or the media being made.
 */
export function activePiece(
  pieces: LivePiece[],
  live: QuestionGenerationLiveItem | undefined,
  typed: unknown,
  progress = 0,
): ActivePiece | null {
  if (!live) return null;
  if (live.stage === "RENDERING_MEDIA") {
    const media = pieces.find(
      (piece) => (piece.key === "audio" || piece.key === "image") && !piece.mediaRef,
    );
    return media ? { key: media.key, lane: media.lane, phase: "media" } : null;
  }
  const writing =
    live.activeAgent === "GENERATOR" && (live.stage === "GENERATING" || live.stage === "REVIEWING");
  if (writing) {
    const raw = lastTopLevelKey(typed);
    const key = raw ? PIECE_OF_KEY[raw] : undefined;
    const piece =
      pieces.find((entry) => entry.key === key) ??
      pieces.find((entry) => entry.lane === "GENERATOR");
    return piece ? { key: piece.key, lane: "GENERATOR", phase: "write" } : null;
  }
  if (live.stage === "VALIDATING") {
    const piece = pieceAt(pieces, progress);
    return piece ? { key: piece.key, lane: "GENERATOR", phase: "validate" } : null;
  }
  if (live.stage === "REVIEWING") {
    const piece = pieceAt(pieces, progress);
    return piece ? { key: piece.key, lane: "REVIEWER", phase: "review" } : null;
  }
  return null;
}
