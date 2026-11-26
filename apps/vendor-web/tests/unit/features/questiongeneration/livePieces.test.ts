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

const NEEDS = { prompt: true, options: true, audio: false, image: false, reference: false };

describe("livePieces", () => {
  it("fills pieces from the typed draft but keeps them off the screen until reviewed", () => {
    const typed = {
      passage: "Text",
      question: "Why?",
      options: ["A", "B"],
      answer: "B",
      answerHintVi: "Gợi ý",
      answerHintEn: "Hint",
    };
    const pieces = livePieces(typed, live({}), NEEDS);
    expect(pieces.map((piece) => piece.key)).toEqual([
      "prompt",
      "options",
      "reference",
      "hintVi",
      "hintEn",
    ]);
    expect(pieces.every((piece) => piece.filled)).toBe(true);
    expect(pieces.some((piece) => piece.ready)).toBe(false);
  });

  it("marks filled pieces ready once the reviewer passed, and media once it is rendered", () => {
    const pieces = livePieces(
      { essayPrompt: "Discuss." },
      live({ stage: "RENDERING_MEDIA", audioRef: "a-1" }),
      { prompt: true, options: false, audio: true, image: false, reference: false },
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

  it("writes a chart's data into its own piece, where the writer's cursor works", () => {
    const typed = {
      title: "Sales",
      chartType: "BAR",
      categories: ["Q1", "Q2"],
      series: [{ name: "Shop", values: [3, 5] }],
    };
    const needs = { prompt: false, options: false, audio: false, image: true, reference: false };
    const pieces = livePieces(typed, live({}), needs);
    const visual = pieces.find((piece) => piece.key === "visual");
    expect(visual?.text).toBe("Sales\nBAR\nQ1, Q2\nShop: 3,5");
    expect(visual?.studentFacing).toBe(false);
    expect(activePiece(pieces, live({}), typed)).toEqual({
      key: "visual",
      lane: "GENERATOR",
      phase: "write",
    });
  });
});

describe("activePiece", () => {
  it("follows the field the writer types now", () => {
    const typed = { passage: "Text", options: ["A"] };
    const pieces = livePieces(typed, live({}), NEEDS);
    expect(activePiece(pieces, live({}), typed)).toEqual({
      key: "options",
      lane: "GENERATOR",
      phase: "write",
    });
  });

  it("points the reviewer at the written text and the renderer at missing media", () => {
    const typed = { passage: "Text" };
    const reviewing = live({ stage: "REVIEWING", activeAgent: "REVIEWER" });
    expect(activePiece(livePieces(typed, reviewing, NEEDS), reviewing, typed)).toEqual({
      key: "prompt",
      lane: "REVIEWER",
      phase: "review",
    });
    const rendering = live({ stage: "RENDERING_MEDIA" });
    const needs = { ...NEEDS, image: true };
    expect(activePiece(livePieces(typed, rendering, needs), rendering, typed)).toEqual({
      key: "image",
      lane: "IMAGE",
      phase: "media",
    });
  });

  it("moves the reviewer on through the written pieces as its checks get done", () => {
    const typed = { passage: "Text", options: ["A", "B"] };
    const reviewing = live({ stage: "REVIEWING", activeAgent: "REVIEWER" });
    const pieces = livePieces(typed, reviewing, NEEDS);
    expect(activePiece(pieces, reviewing, typed, 0.2)?.key).toBe("prompt");
    expect(activePiece(pieces, reviewing, typed, 0.8)?.key).toBe("options");
    expect(activePiece(pieces, reviewing, typed, 1)?.key).toBe("options");
  });
});

describe("livePieces hints and reference", () => {
  it("shows both hint fields and an empty reference field before the writer reaches them", () => {
    const pieces = livePieces({}, live({}), { ...NEEDS, reference: true });
    const keys = pieces.map((piece) => piece.key);
    expect(keys).toEqual(expect.arrayContaining(["reference", "hintVi", "hintEn"]));
    expect(pieces.find((piece) => piece.key === "hintVi")?.filled).toBe(false);
  });

  it("fills the hints from the typed draft", () => {
    const typed = {
      answerHintVi: "Xác định cột cao nhất",
      answerHintEn: "Identify the tallest bar",
    };
    const pieces = livePieces(typed, live({}), NEEDS);
    expect(pieces.find((piece) => piece.key === "hintVi")?.text).toBe("Xác định cột cao nhất");
    expect(pieces.find((piece) => piece.key === "hintEn")?.text).toBe("Identify the tallest bar");
  });
});
