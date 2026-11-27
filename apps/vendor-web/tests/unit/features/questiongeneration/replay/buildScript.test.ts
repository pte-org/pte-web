import { describe, expect, it, vi } from "vitest";
import type { QuestionGenerationLiveEvent } from "@pte/api-client";
import {
  buildScript,
  extendScript,
  frameOf,
  haltRun,
  START_PLAYHEAD,
  type ItemScript,
  type ScriptStep,
} from "../../../../../features/questiongeneration/replay";
import { CONTEXT } from "./playHelpers";
import { INDEX, begin, check, draft, end, live, liveCheck, media, stage, thinking, token, verdict } from "./helpers";

const kinds = (item: ItemScript | undefined): string[] => (item?.steps ?? []).map((step) => step.kind);
const item = (events: Parameters<typeof buildScript>[1]): ItemScript | undefined =>
  buildScript(null, events).items[INDEX];
const step = <K extends ScriptStep["kind"]>(
  script: ItemScript | undefined,
  kind: K,
  at = 0,
): Extract<ScriptStep, { kind: K }> =>
  script?.steps.filter((candidate) => candidate.kind === kind)[at] as Extract<ScriptStep, { kind: K }>;

const oneRound = [
  check("PROMPT"),
  begin("GENERATOR"),
  token("GENERATOR", "{\"promptText\":"),
  token("GENERATOR", "\"hi\"}"),
  check("WRITE"),
  draft(1),
  check("JSON"),
  check("RULES"),
  check("DUPLICATE"),
  begin("REVIEWER"),
  token("REVIEWER", "ok"),
  verdict(true),
  media("audio-1"),
] as const;

describe("buildScript", () => {
  it("returns an empty script for no events", () => {
    expect(buildScript(null, []).items).toEqual({});
  });

  it("puts the steps of one question in the order the pipeline ran them", () => {
    expect(kinds(item(oneRound))).toEqual(["prompt", "write", "check", "check", "check", "review", "media"]);
  });

  it("joins the tokens of a call into one write step and keeps its draft and check", () => {
    const write = step(item(oneRound), "write");

    expect(write.text).toBe("{\"promptText\":\"hi\"}");
    expect(write.draft?.attempt).toBe(1);
    expect(write.check?.step).toBe("WRITE");
    expect(write.superseded).toBe(false);
  });

  it("keeps the end of a train of thought and counts all of it", () => {
    const long = "x".repeat(1000);
    const write = step(item([check("PROMPT"), begin("GENERATOR"), thinking("GENERATOR", long)]), "write");

    expect(write.thinking.length).toBeLessThan(1000);
    expect(write.thinkingChars).toBe(1000);
  });

  it("opens round 2 on a second prompt, keeps round 1 and supersedes its media", () => {
    const rejected = [
      ...oneRound.slice(0, -2),
      verdict(false),
      media("audio-1"),
      check("PROMPT"),
      begin("GENERATOR"),
      token("GENERATOR", "second"),
    ];
    const script = item(rejected);

    expect(script?.round).toBe(2);
    expect(step(script, "write", 0).text).toBe("{\"promptText\":\"hi\"}");
    expect(step(script, "write", 1).text).toBe("second");
    expect(step(script, "media").superseded).toBe(true);
    expect(step(script, "review").verdict?.passed).toBe(false);
  });

  it("makes a repeated begin in the same round a new write attempt and supersedes the first", () => {
    const script = item([
      check("PROMPT"),
      begin("GENERATOR"),
      token("GENERATOR", "first answer"),
      begin("GENERATOR", 2),
      token("GENERATOR", "second answer"),
    ]);
    const writes = script?.steps.filter((candidate) => candidate.kind === "write") ?? [];

    expect(writes).toHaveLength(2);
    expect(step(script, "write", 0).superseded).toBe(true);
    expect(step(script, "write", 1).text).toBe("second answer");
    expect(script?.round).toBe(1);
  });

  it("takes the first begin into a step that was opened empty by its check", () => {
    const script = item([check("PROMPT"), check("WRITE", "RUNNING"), begin("GENERATOR"), token("GENERATOR", "a")]);

    expect(script?.steps.filter((candidate) => candidate.kind === "write")).toHaveLength(1);
  });

  it("keeps the image review inside the media step", () => {
    const script = item([...oneRound, verdict(true, "IMAGE")]);

    expect(kinds(script)).toEqual(["prompt", "write", "check", "check", "check", "review", "media"]);
    expect(step(script, "media").imageReview?.kind).toBe("IMAGE");
  });

  it("opens a round and a write step for a writer that begins before any prompt (older server)", () => {
    const script = item([begin("GENERATOR"), token("GENERATOR", "a")]);

    expect(kinds(script)).toEqual(["prompt", "write"]);
    expect(step(script, "prompt").check).toBeNull();
  });

  it("is the READY of a question that is not saved the end of its script", () => {
    const script = buildScript(null, [...oneRound, stage("READY")], { saveQuestions: false }).items[INDEX];

    expect(script?.ended).toBe(true);
    expect(kinds(script).slice(-2)).toEqual(["assemble", "outcome"]);
  });

  it("does not take READY as the end of a question that is saved", () => {
    const script = buildScript(null, [...oneRound, stage("READY")], { saveQuestions: true }).items[INDEX];

    expect(script?.ended).toBe(false);
  });

  it("drops what arrives after the outcome and says so", () => {
    const onDropped = vi.fn();
    const script = buildScript(null, [...oneRound, stage("READY"), token("GENERATOR", "late")], {
      saveQuestions: false,
      onDropped,
    }).items[INDEX];

    expect(step(script, "write").text).toBe("{\"promptText\":\"hi\"}");
    expect(onDropped).toHaveBeenCalledOnce();
  });

  it("marks the stream ended on end", () => {
    expect(buildScript(null, [...oneRound, end]).streamEnded).toBe(true);
  });

  it("gives the same script for the same input", () => {
    expect(buildScript(null, oneRound)).toEqual(buildScript(null, oneRound));
  });

  it("remembers which model answered each call, and a fallback attempt carries its own", () => {
    const script = item([
      check("PROMPT"),
      begin("GENERATOR", 1, "gpt-6-luna"),
      token("GENERATOR", "first"),
      begin("GENERATOR", 2, "Capstone"),
      token("GENERATOR", "second"),
      begin("REVIEWER", 1, "gpt-6-luna"),
    ]);

    expect(step(script, "write", 0).model).toBe("gpt-6-luna");
    expect(step(script, "write", 1).model).toBe("Capstone");
    expect(step(script, "review").model).toBe("gpt-6-luna");
  });

  it("leaves the model empty when the stream does not say (an older server)", () => {
    expect(step(item([check("PROMPT"), begin("GENERATOR")]), "write").model).toBe("");
  });

  it("goes on after a resumed pause: the stopped write is superseded and the new run is a new round", () => {
    const resumedSnapshot: QuestionGenerationLiveEvent = {
      type: "snapshot",
      items: [live({ generator: { attempt: 1, text: "fresh", thinking: "", thinkingChars: 0 }, checks: [liveCheck("PROMPT")] })],
      finished: false,
    };
    const script = item([
      check("PROMPT"),
      begin("GENERATOR"),
      token("GENERATOR", "stopped half"),
      { type: "end", finished: true },
      resumedSnapshot,
      token("GENERATOR", " and more"),
    ]);
    const writes = script?.steps.filter((candidate) => candidate.kind === "write") ?? [];

    expect(writes).toHaveLength(2);
    expect(step(script, "write", 0).superseded).toBe(true);
    expect(step(script, "write", 0).text).toBe("stopped half");
    expect(step(script, "write", 1).round).toBe(2);
    expect(step(script, "write", 1).text).toBe("fresh and more");
    expect(script?.round).toBe(2);
  });

  it("cuts off the text being written when the stream ends mid-write (a pause or a cancel)", () => {
    const script = item([check("PROMPT"), begin("GENERATOR"), token("GENERATOR", "stopped half"), end]);

    expect(script?.halted).toBe(true);
    expect(step(script, "write").superseded).toBe(true);
    expect(step(script, "write").text).toBe("stopped half");
  });

  it("stops a question its job hands back to waiting, even before the writer began", () => {
    const stopped = haltRun(buildScript(null, [check("PROMPT")]), true).items[INDEX];
    const frame = frameOf(
      stopped,
      { ...START_PLAYHEAD, step: (stopped?.steps.length ?? 1) - 1 },
      { charsPerSecond: 30, pauseEachStep: false, revealAll: false },
      CONTEXT,
    );

    expect(stopped?.halted).toBe(true);
    expect(frame.halted).toBe(true);
    expect(frame.typing).toBe(false);
  });

  it("lets a stopped question run on when the stream sends more about it", () => {
    const stopped = haltRun(buildScript(null, [check("PROMPT")]), true);
    const extended = [begin("GENERATOR"), token("GENERATOR", "go")].reduce(
      (script, event) => extendScript(script, event, { saveQuestions: true }),
      stopped,
    );

    expect(stopped.items[INDEX]?.halted).toBe(true);
    expect(extended.items[INDEX]?.halted).toBeUndefined();
  });

  it("gives the same script back when nothing is left to stop", () => {
    const script = buildScript(null, [...oneRound, end]);

    expect(haltRun(script)).toBe(script);
  });

  it("leaves a question that finished writing alone when the stream ends", () => {
    const script = item([...oneRound, end]);

    expect(script?.halted).toBeUndefined();
    expect(step(script, "write").superseded).toBe(false);
    expect(step(script, "media").superseded).toBe(false);
  });

  it("does not take a snapshot of a finished job as a new run", () => {
    const finishedSnapshot: QuestionGenerationLiveEvent = {
      type: "snapshot",
      items: [live({ checks: [liveCheck("PROMPT")] })],
      finished: true,
    };
    const script = buildScript(null, [check("PROMPT"), begin("GENERATOR"), end, finishedSnapshot]);

    expect(script.items[INDEX]?.runBase).toBeUndefined();
    expect(script.streamEnded).toBe(true);
  });
});
