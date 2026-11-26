import { describe, expect, it } from "vitest";
import type { QuestionGenerationLiveCheck, QuestionGenerationLiveItem } from "@pte/api-client";
import { liveSteps } from "../../../../features/questiongeneration/utils/liveSteps";

const check = (
  step: QuestionGenerationLiveCheck["step"],
  status: QuestionGenerationLiveCheck["status"],
): QuestionGenerationLiveCheck => ({ index: 0, step, status, facts: {}, details: [] });

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

const base = { outcome: null, needsMedia: false, studentPieces: 2, placedPieces: 0, flying: false };
const statuses = (steps: ReturnType<typeof liveSteps>) =>
  Object.fromEntries(steps.map((step) => [step.id, step.status]));

describe("liveSteps", () => {
  it("marks the step running and the ones before it done", () => {
    const steps = liveSteps({
      ...base,
      live: live({
        stage: "VALIDATING",
        checks: [check("PROMPT", "PASSED"), check("WRITE", "PASSED"), check("JSON", "RUNNING")],
      }),
    });
    expect(statuses(steps)).toEqual({
      prompt: "done",
      write: "done",
      validate: "active",
      review: "waiting",
      assemble: "waiting",
      save: "waiting",
    });
  });

  it("shows the media step only when the task makes media", () => {
    const ids = liveSteps({ ...base, needsMedia: true, live: live({}) }).map((step) => step.id);
    expect(ids).toContain("media");
    expect(liveSteps({ ...base, live: live({}) }).map((step) => step.id)).not.toContain("media");
  });

  it("counts writing rounds and flags the review once a draft was sent back", () => {
    const steps = liveSteps({
      ...base,
      live: live({
        stage: "REVIEWING",
        activeAgent: "GENERATOR",
        generator: { attempt: 2, text: "" },
        reviewer: { attempt: 1, text: "" },
      }),
    });
    const write = steps.find((step) => step.id === "write");
    const review = steps.find((step) => step.id === "review");
    expect(write).toMatchObject({ status: "active", round: 2 });
    expect(review).toMatchObject({ round: 1, flagged: true });
  });

  it("keeps the review running when the chart was drawn before it", () => {
    const steps = liveSteps({
      ...base,
      needsMedia: true,
      studentPieces: 1,
      placedPieces: 1,
      live: live({ stage: "REVIEWING", activeAgent: "REVIEWER", imageRef: "img-1" }),
    });
    expect(statuses(steps)).toMatchObject({
      review: "active",
      media: "done",
      assemble: "done",
      save: "waiting",
    });
  });

  it("follows the pieces onto the exam screen and finishes on save", () => {
    const placing = liveSteps({ ...base, placedPieces: 1, live: live({ stage: "READY" }) });
    expect(statuses(placing).assemble).toBe("active");
    const saved = liveSteps({
      ...base,
      outcome: "SAVED",
      placedPieces: 2,
      live: live({ stage: "SAVED" }),
    });
    expect(saved.every((step) => step.status === "done")).toBe(true);
    const failed = liveSteps({
      ...base,
      outcome: "FAILED",
      live: live({ stage: "REVIEWING", activeAgent: "REVIEWER" }),
    });
    expect(statuses(failed)).toMatchObject({
      write: "done",
      review: "failed",
      assemble: "waiting",
      save: "failed",
    });
  });
});
