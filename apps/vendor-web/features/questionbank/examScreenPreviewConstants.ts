/**
 * Wording of the student's exam screen, as the PTE app shows it. It is student-facing, so it stays
 * in English and is not run through the admin translation.
 */
export const EXAM_SCREEN_TEXT = {
  NO_TASK: "—",
  EMPTY_PROMPT: "The prompt appears here as you type.",
  EMPTY_IMAGE: "The image appears here once uploaded.",
  EMPTY_AUDIO: "Upload the audio to play it here.",
  IMAGE_ALT: "Image shown to the student",
  AUDIO_PLAYER: "Audio Player",
  AUDIO_RECORDER: "Audio Recorder",
  PLAYER_READY: "Press play to listen",
  RECORDER_WAITING: "Recording starts after the prompt",
  PLAY: "Play",
  PAUSE: "Pause",
  RECORD: "Record",
  STOP: "Stop",
  SEEK: "Audio position",
  TYPE_HERE: "Type your answer here",
  WORD_COUNT: "Total Word Count",
  WORD_RANGE: "{min} – {max} words",
  MIN_ONLY: "At least {min} words",
  MAX_ONLY: "At most {max} words",
  OPTION_FALLBACK: "…",
} as const;

export const EXAM_SCREEN_SPEAKING_SECTION = "SPEAKING";
export const EXAM_SCREEN_METER_SEGMENTS = 12;
export const EXAM_SCREEN_METER_LIVE_SEGMENTS = 4;
