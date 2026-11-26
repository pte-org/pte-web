import { describe, expect, it } from "vitest";
import {
  buildScript,
  mergeSnapshot,
  rankOf,
  settleOutcome,
  type ItemScript,
  type ScriptStep,
} from "../../../../../features/questiongeneration/replay";
import { INDEX, begin, check, live, liveCheck, liveDraft, liveReview, token } from "./helpers";

const ctx = { saveQuestions: true };
const fromSnapshot = (item: ReturnType<typeof live>, saveQuestions = true): ItemScript | undefined =>
  buildScript([item], [], { saveQuestions }).items[INDEX];
const kinds = (item: ItemScript | undefined): string[] => (item?.steps ?? []).map((step) => step.kind);
const of = <K extends ScriptStep["kind"]>(item: ItemScript | undefined, kind: K, at = 0): Extract<ScriptStep, { kind: K }> =>
  item?.steps.filter((step) => step.kind === kind)[at] as Extract<ScriptStep, { kind: K }>;
const rankedUp = (item: ItemScript | undefined): boolean =>
  (item?.steps ?? []).every((step, at, all) => at === 0 || rankOf(step) >= rankOf(all[at - 1] as ScriptStep));

describe("snapshot to steps (the table in mergeSnapshot)", () => {
  it("has no steps for a question that has not begun", () => {
    expect(kinds(fromSnapshot(live({ stage: "QUEUED", activeAgent: null })))).toEqual([]);
  });

  it("round 1: prompt, write and the checks in order", () => {
    const item = fromSnapshot(
      live({
        generator: { attempt: 1, text: "abc" },
        checks: [liveCheck("PROMPT"), liveCheck("WRITE"), liveCheck("JSON"), liveCheck("RULES")],
        draft: liveDraft(1),
      }),
    );

    expect(kinds(item)).toEqual(["prompt", "write", "check", "check"]);
    expect(of(item, "write").text).toBe("abc");
    expect(of(item, "write").draft?.attempt).toBe(1);
    expect(item?.round).toBe(1);
  });

  it("adds the review of the round when a reviewer text or verdict is present", () => {
    const item = fromSnapshot(
      live({
        generator: { attempt: 1, text: "abc" },
        reviewer: { attempt: 1, text: "looks fine" },
        checks: [liveCheck("PROMPT"), liveCheck("JSON"), liveCheck("REVIEW_VERDICT")],
        review: liveReview(true),
        draft: liveDraft(1),
      }),
    );

    expect(kinds(item)).toEqual(["prompt", "write", "check", "review"]);
    expect(of(item, "review").text).toBe("looks fine");
    expect(of(item, "review").verdict?.passed).toBe(true);
    expect(Object.keys(of(item, "review").checks)).toEqual(["REVIEW_VERDICT"]);
  });

  it("reconnect right after a rewrite began: the old draft and review belong to round 1", () => {
    const item = fromSnapshot(
      live({
        generator: { attempt: 2, text: "round two so far" },
        reviewer: { attempt: 1, text: "rejected" },
        checks: [liveCheck("PROMPT")],
        draft: liveDraft(1),
        review: liveReview(false),
      }),
    );

    expect(kinds(item)).toEqual(["write", "review", "prompt", "write"]);
    expect(of(item, "write", 0).round).toBe(1);
    expect(of(item, "write", 0).draft?.attempt).toBe(1);
    expect(of(item, "review").round).toBe(1);
    expect(of(item, "review").verdict?.passed).toBe(false);
    expect(of(item, "write", 1).round).toBe(2);
    expect(of(item, "write", 1).text).toBe("round two so far");
    expect(of(item, "write", 1).draft).toBeNull();
    expect(item?.round).toBe(2);
    expect(rankedUp(item)).toBe(true);
  });

  it("round 2 with checks past WRITE: the draft belongs to round 2 and round 1 is a count", () => {
    const item = fromSnapshot(
      live({
        generator: { attempt: 2, text: "two" },
        reviewer: { attempt: 2, text: "good" },
        checks: [liveCheck("PROMPT"), liveCheck("JSON"), liveCheck("REVIEW_VERDICT")],
        draft: liveDraft(2),
        review: liveReview(true),
      }),
    );

    expect(kinds(item)).toEqual(["previousRounds", "prompt", "write", "check", "review"]);
    expect(of(item, "previousRounds").rounds).toBe(1);
    expect(of(item, "write").draft?.attempt).toBe(2);
    expect(of(item, "review").round).toBe(2);
    expect(rankedUp(item)).toBe(true);
  });

  it("sums up the rounds before the one the old draft belongs to", () => {
    const item = fromSnapshot(
      live({
        generator: { attempt: 3, text: "three" },
        reviewer: { attempt: 2, text: "no" },
        checks: [liveCheck("PROMPT")],
        draft: liveDraft(2),
        review: liveReview(false),
      }),
    );

    expect(kinds(item)).toEqual(["previousRounds", "write", "review", "prompt", "write"]);
    expect(of(item, "previousRounds").rounds).toBe(1);
    expect(of(item, "write", 0).round).toBe(2);
    expect(of(item, "write", 1).round).toBe(3);
  });

  it("adds the media of the current round", () => {
    const item = fromSnapshot(
      live({
        generator: { attempt: 1, text: "a" },
        checks: [liveCheck("PROMPT"), liveCheck("JSON")],
        reviewer: { attempt: 1, text: "ok" },
        review: liveReview(true),
        draft: liveDraft(1),
        audioRef: "audio-1",
      }),
    );

    expect(kinds(item)).toEqual(["prompt", "write", "check", "review", "media"]);
    expect(of(item, "media").audioRef).toBe("audio-1");
  });

  it("puts an image review in the media step, not in the content review", () => {
    const item = fromSnapshot(
      live({
        generator: { attempt: 1, text: "a" },
        checks: [liveCheck("PROMPT"), liveCheck("JSON")],
        review: liveReview(true, "IMAGE"),
        imageRef: "img-1",
        draft: liveDraft(1),
      }),
    );

    expect(of(item, "media").imageReview?.kind).toBe("IMAGE");
    expect(kinds(item)).not.toContain("review");
  });

  it("is the outcome READY when the stage is READY and the job does not save its questions", () => {
    const snapshot = live({ stage: "READY", generator: { attempt: 1, text: "a" }, checks: [liveCheck("PROMPT")] });

    expect(fromSnapshot(snapshot, false)?.ended).toBe(true);
    expect(fromSnapshot(snapshot, true)?.ended).toBe(false);
  });
});

describe("mergeSnapshot into a script that exists", () => {
  const running = buildScript(null, [check("PROMPT"), begin("GENERATOR"), token("GENERATOR", "abc")]);

  it("takes a longer text that starts with the old one", () => {
    const merged = mergeSnapshot(
      running,
      [live({ generator: { attempt: 1, text: "abcdef" }, checks: [liveCheck("PROMPT")] })],
      ctx,
    );

    expect(of(merged.items[INDEX], "write").text).toBe("abcdef");
  });

  it("keeps the old text when the snapshot's is shorter or different", () => {
    const shorter = mergeSnapshot(running, [live({ generator: { attempt: 1, text: "ab" } })], ctx);
    const different = mergeSnapshot(running, [live({ generator: { attempt: 1, text: "xyzxyz" } })], ctx);

    expect(of(shorter.items[INDEX], "write").text).toBe("abc");
    expect(of(different.items[INDEX], "write").text).toBe("abc");
  });

  it("appends a step the script lacks at the end, never inserting it", () => {
    const merged = mergeSnapshot(
      running,
      [
        live({
          generator: { attempt: 1, text: "abc" },
          checks: [liveCheck("PROMPT"), liveCheck("JSON")],
        }),
      ],
      ctx,
    );

    expect(kinds(merged.items[INDEX])).toEqual(["prompt", "write", "check"]);
  });

  it("drops a step that would fall before the ones the script already has", () => {
    const ahead = buildScript(null, [
      check("PROMPT"),
      begin("GENERATOR"),
      check("PROMPT"),
      begin("GENERATOR"),
      token("GENERATOR", "two"),
    ]);
    const merged = mergeSnapshot(
      ahead,
      [live({ generator: { attempt: 1, text: "one" }, checks: [liveCheck("PROMPT"), liveCheck("JSON")] })],
      ctx,
    );

    expect(kinds(merged.items[INDEX])).toEqual(["prompt", "write", "prompt", "write"]);
    expect(merged.items[INDEX]?.round).toBe(2);
  });

  it("never resets: merging the same snapshot twice changes nothing", () => {
    const snapshot = [live({ generator: { attempt: 1, text: "abcdef" }, checks: [liveCheck("PROMPT")] })];
    const once = mergeSnapshot(running, snapshot, ctx);

    expect(mergeSnapshot(once, snapshot, ctx)).toEqual(once);
  });

  it("leaves a question that already has its outcome alone", () => {
    const done = settleOutcome(running, INDEX, "SAVED", "end");
    const merged = mergeSnapshot(
      done,
      [live({ generator: { attempt: 1, text: "abcdef" }, checks: [liveCheck("PROMPT"), liveCheck("JSON")] })],
      ctx,
    );

    expect(merged.items[INDEX]).toBe(done.items[INDEX]);
  });

  it("matches the latest write of a round whatever its attempt number", () => {
    const retried = buildScript(null, [
      check("PROMPT"),
      begin("GENERATOR"),
      token("GENERATOR", "first"),
      begin("GENERATOR", 2),
      token("GENERATOR", "second"),
    ]);
    const merged = mergeSnapshot(
      retried,
      [live({ generator: { attempt: 2, text: "second and more" }, checks: [liveCheck("PROMPT")] })],
      ctx,
    );
    const writes = merged.items[INDEX]?.steps.filter((step) => step.kind === "write") ?? [];

    expect(writes).toHaveLength(2);
    expect(of(merged.items[INDEX], "write", 1).text).toBe("second and more");
    expect(of(merged.items[INDEX], "write", 0).text).toBe("first");
  });

  it("takes the model of the writer and the reviewer from a snapshot, without changing one already known", () => {
    const known = buildScript(null, [check("PROMPT"), begin("GENERATOR", 1, "Capstone"), token("GENERATOR", "abc")]);
    const merged = mergeSnapshot(
      known,
      [live({ generator: { attempt: 1, text: "abcdef", model: "gpt-6-luna" }, checks: [liveCheck("PROMPT")] })],
      ctx,
    );
    const fresh = fromSnapshot(
      live({
        generator: { attempt: 1, text: "a", model: "gpt-6-luna" },
        reviewer: { attempt: 1, text: "ok", model: "Capstone" },
        checks: [liveCheck("PROMPT"), liveCheck("JSON")],
        review: liveReview(true),
        draft: liveDraft(1),
      }),
    );

    expect(of(merged.items[INDEX], "write").model).toBe("Capstone");
    expect(of(fresh, "write").model).toBe("gpt-6-luna");
    expect(of(fresh, "review").model).toBe("Capstone");
  });
});
