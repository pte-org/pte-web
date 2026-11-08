import type { CreateQuestionRequest } from "@pte/api-client";
import type { LiveLane } from "./liveConstants";

/** The parts of the question form an agent writes or reviews, in the order they are shown being written. */
export type AgentField = "promptText" | "referenceAnswerText" | "correctAnswerText" | "options" | "wordCount";

/** Values an AI run put into the question form, the fields marked in an agent's colour, and whether it is locked. */
export interface AgentFill {
  values: Partial<CreateQuestionRequest>;
  marks: Partial<Record<AgentField, LiveLane>>;
  locked: boolean;
}
