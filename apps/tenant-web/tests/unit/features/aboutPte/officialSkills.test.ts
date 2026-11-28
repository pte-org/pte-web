import { describe, expect, it } from "vitest";
import { TASK_NAMES } from "../../../../features/aboutPte/constants/miniExam";
import {
  contributingSkills,
  STANDARD_TASK_WEIGHTS,
  type SkillKey,
} from "../../../../features/aboutPte/constants/scoringWeights";

/**
 * The "communicative skills scored" column of Pearson's PTE Academic Test Taker Score Guide (2026 edition,
 * pages 15–44). Checked against the PDF on 2026-11-28; a type that lists two skills is an integrated type.
 */
const OFFICIAL_SKILLS: Record<string, readonly SkillKey[]> = {
  READ_ALOUD: ["speaking"],
  REPEAT_SENTENCE: ["speaking", "listening"],
  DESCRIBE_IMAGE: ["speaking"],
  RE_TELL_LECTURE: ["speaking", "listening"],
  ANSWER_SHORT_QUESTION: ["listening"],
  SUMMARIZE_GROUP_DISCUSSION: ["speaking", "listening"],
  RESPOND_TO_A_SITUATION: ["speaking"],
  SUMMARIZE_WRITTEN_TEXT: ["writing", "reading"],
  WRITE_ESSAY: ["writing"],
  FILL_IN_THE_BLANKS_DROPDOWN: ["reading"],
  MC_READING_MULTIPLE: ["reading"],
  RE_ORDER_PARAGRAPHS: ["reading"],
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: ["reading"],
  MC_READING_SINGLE: ["reading"],
  SUMMARIZE_SPOKEN_TEXT: ["writing", "listening"],
  MC_LISTENING_MULTIPLE: ["listening"],
  FILL_IN_THE_BLANKS_TYPE_IN: ["listening"],
  HIGHLIGHT_CORRECT_SUMMARY: ["listening", "reading"],
  MC_LISTENING_SINGLE: ["listening"],
  SELECT_MISSING_WORD: ["listening"],
  HIGHLIGHT_INCORRECT_WORDS: ["listening", "reading"],
  WRITE_FROM_DICTATION: ["writing", "listening"],
};

const sorted = (skills: readonly SkillKey[]): SkillKey[] => [...skills].sort();

describe("skills each question type counts towards", () => {
  it("covers all 22 types of the standard template", () => {
    expect(Object.keys(OFFICIAL_SKILLS).sort()).toEqual(STANDARD_TASK_WEIGHTS.map((task) => task.key).sort());
  });

  it.each(STANDARD_TASK_WEIGHTS.map((task) => task.key))("%s matches the Score Guide", (key) => {
    const task = STANDARD_TASK_WEIGHTS.find((entry) => entry.key === key);
    expect(task).toBeDefined();
    expect(sorted(contributingSkills(task!))).toEqual(sorted(OFFICIAL_SKILLS[key]));
  });

  it("marks exactly eight types as integrated", () => {
    const integrated = STANDARD_TASK_WEIGHTS.filter((task) => contributingSkills(task).length > 1);
    expect(integrated).toHaveLength(8);
  });

  it("does not name a single-skill type as Reading & Writing", () => {
    expect(Object.values(TASK_NAMES).some((name) => name.includes("Reading & Writing"))).toBe(false);
  });
});
