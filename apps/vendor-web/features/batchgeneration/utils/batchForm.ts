import {
  BATCH_MAX_TOPIC_HINTS,
  BATCH_TOPIC_HINT_MAX_LENGTH,
  BATCH_TOPIC_HINT_PATTERN,
} from "../constants";

/** Why a row's topics would be refused by the server; mirrors its rules. */
export type TopicHintsError = "errTopicCount" | "errTopicLength" | "errTopicChars";

/** The topics of a row: one per line, trimmed, blanks and duplicates dropped (as the server does). */
export function parseTopicHints(text: string): string[] {
  const topics = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
  return [...new Set(topics)];
}

export function topicHintsError(topics: readonly string[]): TopicHintsError | undefined {
  if (topics.length > BATCH_MAX_TOPIC_HINTS) return "errTopicCount";
  if (topics.some((topic) => topic.length > BATCH_TOPIC_HINT_MAX_LENGTH)) return "errTopicLength";
  if (topics.some((topic) => !BATCH_TOPIC_HINT_PATTERN.test(topic))) return "errTopicChars";
  return undefined;
}
