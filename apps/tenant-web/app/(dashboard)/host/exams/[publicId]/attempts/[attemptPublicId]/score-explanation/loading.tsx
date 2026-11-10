import type { ReactElement } from "react";
import { DashboardLoadingState } from "@pte/ui";

export default function ScoreExplanationLoading(): ReactElement {
  return <DashboardLoadingState variant="detail" />;
}
