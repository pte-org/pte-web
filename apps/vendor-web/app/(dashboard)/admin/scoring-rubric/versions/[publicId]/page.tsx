import type { ReactElement } from "react";
import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { RubricVersionDetailView } from "@/features/scoringrubric/components/RubricVersionDetailView";
import { ScoringSimulatorDialog } from "@/features/scoringsimulator/components/ScoringSimulatorDialog";

interface VersionPageProps { params: Promise<{ publicId: string }> }
const VersionPage = async ({ params }: VersionPageProps): Promise<ReactElement> => {
  const { publicId } = await params;
  return <RequireAuth allowedRoles={ACADEMIC_ROLES}><RubricVersionDetailView id={publicId} sidePanel={<ScoringSimulatorDialog />} /></RequireAuth>;
};
export default VersionPage;
