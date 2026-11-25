import { describe, expect, it } from "vitest";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { activePiece, livePieces } from "../../../../features/questiongeneration/utils/livePieces";

const live = (change: Partial<QuestionGenerationLiveItem>): QuestionGenerationLiveItem => ({
  index: 0,
  stage: "GENERATING",
  activeAgent: "GENERATOR",
  generator: null,
  reviewer: null,
  audioRef: null,
  imageRef: null,
  ...change,
});

const NEEDS = { prompt: true, options: true, audio: false, image: false };

describe("livePieces", () => {
  it("fills pieces from the typed draft but keeps them off the screen until reviewed", () => {
    const typed = { passage: "Text", question: "Why?", options: ["A", "B"], answer: "B" };
    const pieces = livePieces(typed, live({}), NEEDS);
    expect(pieces.map((piece) => piece.key)).toEqual(["prompt", "options", "reference"]);
    expect(pieces.every((piece) => piece.filled)).toBe(true);
    expect(pieces.some((piece) => piece.ready)).toBe(false);
  });

  it("marks filled pieces ready once the reviewer passed, and media once it is rendered", () => {
    const pieces = livePieces(
      { essayPrompt: "Discuss." },
      live({ stage: "RENDERING_MEDIA", audioRef: "a-1" }),
      { prompt: true, options: false, audio: true, image: false },
    );
    expect(pieces.find((piece) => piece.key === "prompt")?.ready).toBe(true);
    expect(pieces.find((piece) => piece.key === "audio")?.ready).toBe(true);
  });

  it("keeps the transcript off the student's screen and reads a dialogue as lines", () => {
    const typed = {
      turns: [
        { speaker: "Anna", text: "Hi" },
        { speaker: "Ben", text: "Hello" },
      ],
    };
    const transcript = livePieces(typed, live({}), NEEDS).find(
      (piece) => piece.key === "transcript",
    );
    expect(transcript?.text).toBe("Anna: Hi\nBen: Hello");
    expect(transcript?.studentFacing).toBe(false);
  });
});

describe("activePiece", () => {
  it("follows the field the writer types now", () => {
    const typed = { passage: "Text", options: ["A"] };
    const pieces = livePieces(typed, live({}), NEEDS);
    expect(activePiece(pieces, live({}), typed)).toEqual({ key: "options", lane: "GENERATOR" });
  });

  it("points the reviewer at the written text and the renderer at missing media", () => {
    const typed = { passage: "Text" };
    const reviewing = live({ stage: "REVIEWING", activeAgent: "REVIEWER" });
    expect(activePiece(livePieces(typed, reviewing, NEEDS), reviewing, typed)).toEqual({
      key: "prompt",
      lane: "REVIEWER",
    });
    const rendering = live({ stage: "RENDERING_MEDIA" });
    const needs = { ...NEEDS, image: true };
    expect(activePiece(livePieces(typed, rendering, needs), rendering, typed)).toEqual({
      key: "image",
      lane: "IMAGE",
    });
  });
});
