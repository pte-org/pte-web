import type { CreateQuestionRequest, QuestionGenerationLiveItem } from "@pte/api-client";
import type { LiveLane } from "../liveConstants";
import { typedOptions, typedPrompt } from "./livePreviewDraft";
import { lastTopLevelKey } from "./partialJson";

/** One part of a question an agent makes; the student-facing ones are carried onto the exam screen when done. */
export type PieceKey = "prompt" | "options" | "audio" | "image" | "reference" | "transcript";

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
  answer: "reference",
  keyPoints: "reference",
  transcript: "transcript",
  turns: "transcript",
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
  const reference = fields?.referenceAnswerText ?? firstText(typed, ["answer", "keyPoints"]);
  const transcript = firstText(typed, ["transcript", "turns"]);
  const pieces: LivePiece[] = [];
  if (needs.prompt || prompt) pieces.push(textPiece("prompt", prompt, [], passed, true));
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
  if (reference) pieces.push(textPiece("reference", reference, [], passed, false));
  if (transcript) pieces.push(textPiece("transcript", transcript, [], passed, false));
  return pieces;
}

export interface ActivePiece {
  key: PieceKey;
  lane: LiveLane;
}

/** The piece an agent works on now, so its cursor can sit there: the field being typed, reviewed or rendered. */
export function activePiece(
  pieces: LivePiece[],
  live: QuestionGenerationLiveItem | undefined,
  typed: unknown,
): ActivePiece | null {
  if (!live) return null;
  if (live.stage === "RENDERING_MEDIA") {
    const media = pieces.find(
      (piece) => (piece.key === "audio" || piece.key === "image") && !piece.mediaRef,
    );
    return media ? { key: media.key, lane: media.lane } : null;
  }
  const writing =
    live.activeAgent === "GENERATOR" && (live.stage === "GENERATING" || live.stage === "REVIEWING");
  if (writing) {
    const raw = lastTopLevelKey(typed);
    const key = raw ? PIECE_OF_KEY[raw] : undefined;
    const piece =
      pieces.find((entry) => entry.key === key) ??
      pieces.find((entry) => entry.lane === "GENERATOR");
    return piece ? { key: piece.key, lane: "GENERATOR" } : null;
  }
  if (live.stage === "REVIEWING" || live.stage === "VALIDATING") {
    const piece = pieces.find((entry) => entry.lane === "GENERATOR" && entry.filled);
    return piece ? { key: piece.key, lane: "REVIEWER" } : null;
  }
  return null;
}
