import type { ReactElement } from "react";
import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { RubricVersionEditView } from "@/features/scoringrubric/components/RubricVersionEditView";

interface VersionEditPageProps { params: Promise<{ publicId: string }> }
const VersionEditPage = async ({ params }: VersionEditPageProps): Promise<ReactElement> => {
  const { publicId } = await params;
  return <RequireAuth allowedRoles={ACADEMIC_ROLES}><RubricVersionEditView id={publicId} /></RequireAuth>;
};
export default VersionEditPage;
