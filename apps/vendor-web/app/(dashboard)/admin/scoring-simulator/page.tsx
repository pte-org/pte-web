import { redirect } from "next/navigation";
import { SCORING_RUBRIC_BASE_PATH } from "@/features/scoringrubric/constants";

/** The simulator is a dialog on the rubric screen now; an old link or bookmark lands there. */
export default function ScoringSimulatorPage(): never {
  redirect(SCORING_RUBRIC_BASE_PATH);
}
