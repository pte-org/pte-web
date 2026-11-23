/**
 * One sample item per question type for the score lab, scored with the real rule of that type
 * (Score Guide pp. 15–44; app: RubricScorer and the objective scorers). Every control is a count.
 */
export interface LabControl {
  /** Trait name, or a counter key resolved through the copy catalog (blanks, pairs, words, …). */
  key: string;
  max: number;
  gate?: boolean;
}

export type LabRule = "traits" | "ratio" | "plusMinus" | "single";

export interface LabSpec {
  rule: LabRule;
  controls: readonly LabControl[];
}

const speech = (contentMax: number, gate: boolean): LabControl[] => [
  { key: "Content", max: contentMax, gate },
  { key: "Pronunciation", max: 5 },
  { key: "Oral Fluency", max: 5 },
];
const traits = (controls: LabControl[]): LabSpec => ({ rule: "traits", controls });
const ratio = (key: string, max: number): LabSpec => ({ rule: "ratio", controls: [{ key, max }] });
const plusMinus = (correctMax: number, wrongMax: number): LabSpec => ({
  rule: "plusMinus",
  controls: [
    { key: "correctPicks", max: correctMax },
    { key: "wrongPicks", max: wrongMax },
  ],
});
const SINGLE: LabSpec = { rule: "single", controls: [{ key: "correct", max: 1 }] };

/** Sample Read Aloud passage length (N) used by the lab. */
export const READ_ALOUD_SAMPLE_WORDS = 10;

export const LAB_SPECS: Record<string, LabSpec> = {
  READ_ALOUD: traits(speech(READ_ALOUD_SAMPLE_WORDS, false)),
  REPEAT_SENTENCE: traits(speech(3, false)),
  DESCRIBE_IMAGE: traits(speech(6, true)),
  RE_TELL_LECTURE: traits(speech(6, true)),
  ANSWER_SHORT_QUESTION: SINGLE,
  SUMMARIZE_GROUP_DISCUSSION: traits(speech(6, true)),
  RESPOND_TO_A_SITUATION: traits(speech(6, true)),
  SUMMARIZE_WRITTEN_TEXT: traits([
    { key: "Content", max: 4, gate: true },
    { key: "Form", max: 1, gate: true },
    { key: "Grammar", max: 2 },
    { key: "Vocabulary", max: 2 },
  ]),
  WRITE_ESSAY: traits([
    { key: "Content", max: 6, gate: true },
    { key: "Form", max: 2, gate: true },
    { key: "Development, Structure & Coherence", max: 6 },
    { key: "Grammar", max: 2 },
    { key: "General Linguistic Range", max: 6 },
    { key: "Vocabulary Range", max: 2 },
    { key: "Spelling", max: 2 },
  ]),
  FILL_IN_THE_BLANKS_DROPDOWN: ratio("blanks", 4),
  MC_READING_MULTIPLE: plusMinus(3, 2),
  RE_ORDER_PARAGRAPHS: ratio("pairs", 4),
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: ratio("blanks", 4),
  MC_READING_SINGLE: SINGLE,
  SUMMARIZE_SPOKEN_TEXT: traits([
    { key: "Content", max: 4, gate: true },
    { key: "Form", max: 2, gate: true },
    { key: "Grammar", max: 2 },
    { key: "Vocabulary", max: 2 },
    { key: "Spelling", max: 2 },
  ]),
  MC_LISTENING_MULTIPLE: plusMinus(3, 2),
  FILL_IN_THE_BLANKS_TYPE_IN: ratio("words", 5),
  HIGHLIGHT_CORRECT_SUMMARY: SINGLE,
  MC_LISTENING_SINGLE: SINGLE,
  SELECT_MISSING_WORD: SINGLE,
  HIGHLIGHT_INCORRECT_WORDS: plusMinus(3, 3),
  WRITE_FROM_DICTATION: ratio("words", 10),
};

/** Item score 0–100 from the control values, following the rule of the question type. */
export const labItemScore = (spec: LabSpec, values: readonly number[]): number => {
  const [first = 0, second = 0] = values;
  switch (spec.rule) {
    case "traits": {
      const gated = spec.controls.some((control, index) => control.gate && values[index] === 0);
      if (gated) return 0;
      const achieved = values.reduce((sum, value) => sum + value, 0);
      const maximum = spec.controls.reduce((sum, control) => sum + control.max, 0);
      return Math.round((achieved / maximum) * 100);
    }
    case "ratio":
      return Math.round((first / spec.controls[0].max) * 100);
    case "plusMinus":
      return Math.round((Math.max(first - second, 0) / spec.controls[0].max) * 100);
    case "single":
      return first > 0 ? 100 : 0;
  }
};

/** Whether a gated trait is at 0, which zeroes the whole item. */
export const isGateTriggered = (spec: LabSpec, values: readonly number[]): boolean =>
  spec.rule === "traits" && spec.controls.some((control, index) => control.gate && values[index] === 0);

/** A believable middle-of-the-road attempt: roughly 60% of every control, no wrong picks. */
export const startingValues = (spec: LabSpec): number[] =>
  spec.controls.map((control) =>
    control.key === "wrongPicks" ? 1 : Math.max(1, Math.round(control.max * 0.6)),
  );
