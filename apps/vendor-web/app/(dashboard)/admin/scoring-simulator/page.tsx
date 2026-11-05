import type { ReactElement } from "react";
import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { ScoringSimulatorView } from "@/features/scoringsimulator/components/ScoringSimulatorView";

const ScoringSimulatorPage = (): ReactElement => (
  <RequireAuth allowedRoles={ACADEMIC_ROLES}><ScoringSimulatorView /></RequireAuth>
);
export default ScoringSimulatorPage;
