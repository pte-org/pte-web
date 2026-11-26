import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Keeps the live view of AI question generation on one source of truth. The steps, the chips and the outcome of the
 * question being replayed come from the replay engine's frame (`features/questiongeneration/replay/`); reading the
 * server's stage or status to decide them is how the screen ran ahead of the replay before. The allowlist below may only
 * shrink: add a file only with a reason, and delete an entry as soon as it no longer applies.
 */
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const FEATURES = ["features/questiongeneration", "features/batchgeneration"] as const;

/** Names of the older, separate sources of state that the replay engine replaced. */
const FORBIDDEN_IDENTIFIERS = [
  "gateLive",
  "useStepGate",
  "liveSteps",
  "endedWhenOpened",
  "replayingId",
  "stillTyping",
  "useDropQueue",
  "useTypedText",
  "useChartReplay",
  "REPLAY_ENGINE_ENABLED",
] as const;

/** The server's stage or status of a question or job, read straight off the record. */
const SERVER_STATE = /\b(?:record|job)\??\.(?:stage|status)\b|\bitems\[[^\]]*\]\??\.stage\b/;

/** Files in `components/` and `hooks/` that may read the server's state, and why that is not the replayed question. */
const SERVER_STATE_ALLOWLIST: Readonly<Record<string, string>> = {
  "features/questiongeneration/components/LiveGenerationView.tsx":
    "the Cancel button, the finished flag and READY of the question form page: about the job, not the steps replayed",
  "features/questiongeneration/components/LiveJobPanel.tsx":
    "whether the job is finished decides if the live view or the outcome list is shown, not a step",
  "features/questiongeneration/components/_LiveJobItemList.tsx":
    "the chips of the questions that are not open (the open one follows its frame) and the question opened by default",
  "features/questiongeneration/hooks/useLiveJob.ts":
    "the job poll and the outcome the job record reports, which enters the script only through settleOutcome",
  "features/batchgeneration/components/_BatchJobPicker.tsx":
    "the chip of each job in the list; the open job is adjusted by jobChipStatus from the replay",
  "features/batchgeneration/components/_BatchSidebar.tsx": "the status badges of the jobs that are not open",
};

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx)$/.test(name) ? [path] : [];
  });
}

const files = FEATURES.flatMap((feature) => sourceFiles(join(ROOT, feature))).map((path) => ({
  path,
  name: relative(ROOT, path).split(sep).join("/"),
  text: readFileSync(path, "utf8"),
}));

describe("replay engine architecture", () => {
  it("finds the sources it guards", () => {
    expect(files.length).toBeGreaterThan(50);
    expect(files.some((file) => file.name.endsWith("replay/frameOf.ts"))).toBe(true);
  });

  it.each(FORBIDDEN_IDENTIFIERS)("does not bring back %s", (identifier) => {
    const using = files.filter((file) => new RegExp(`\\b${identifier}\\b`).test(file.text)).map((file) => file.name);

    expect(using).toEqual([]);
  });

  it("reads the server's stage or status only where the allowlist says why", () => {
    const reading = files
      .filter((file) => /\/(?:components|hooks)\//.test(file.name) && SERVER_STATE.test(file.text))
      .map((file) => file.name)
      .filter((name) => !(name in SERVER_STATE_ALLOWLIST));

    expect(reading).toEqual([]);
  });

  it("keeps no allowlist entry for a file that is gone or no longer reads the server's state", () => {
    const stale = Object.keys(SERVER_STATE_ALLOWLIST).filter((name) => {
      const file = files.find((candidate) => candidate.name === name);
      return !existsSync(join(ROOT, name)) || !file || !SERVER_STATE.test(file.text);
    });

    expect(stale).toEqual([]);
  });

  it("gives every allowlist entry a reason", () => {
    expect(Object.values(SERVER_STATE_ALLOWLIST).every((reason) => reason.trim().length > 20)).toBe(true);
  });

  it("keeps the engine free of React and of the app alias, so it runs without a screen", () => {
    const engine = files.filter((file) => file.name.includes("/replay/"));

    expect(engine.length).toBeGreaterThan(10);
    for (const file of engine) {
      expect(file.text, file.name).not.toMatch(/from "react"|from "@\//);
    }
  });
});
