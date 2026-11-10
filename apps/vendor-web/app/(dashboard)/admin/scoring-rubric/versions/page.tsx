import { redirect } from "next/navigation";
import { SCORING_RUBRIC_BASE_PATH } from "@/features/scoringrubric/constants";

/** The versions are the rubric screen's own list now; an old link or bookmark lands there. */
export default function RubricVersionsPage(): never {
  redirect(SCORING_RUBRIC_BASE_PATH);
}
