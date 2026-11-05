import type { ReactElement } from "react";
import { DashboardLoadingState } from "@pte/ui";

export default function Loading(): ReactElement {
  return <DashboardLoadingState variant="table" />;
}
