import type { ReactElement } from "react";
import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { RubricVersionDetailView } from "@/features/scoringrubric/components/RubricVersionDetailView";

interface VersionPageProps { params: Promise<{ publicId: string }> }
const VersionPage = async ({ params }: VersionPageProps): Promise<ReactElement> => {
  const { publicId } = await params;
  return <RequireAuth allowedRoles={ACADEMIC_ROLES}><RubricVersionDetailView id={publicId} /></RequireAuth>;
};
export default VersionPage;
