import type { SimulationTextMetrics } from "@pte/api-client";

export interface SimulatorState {
  traitScores: Record<string, number>;
  textMetrics: SimulationTextMetrics;
  wordCount: number;
}

export type SimulatorText = { [K in keyof typeof import("./constants").SIMULATOR_TEXT.en]: string };
