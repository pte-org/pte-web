import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { PracticeRubricEditorView } from "@/features/practicerubric/components";

interface Props { params: Promise<{ publicId: string }> }

export default async function PracticeRubricEditPage({ params }: Props) {
  const { publicId } = await params;
  return <RequireAuth allowedRoles={ACADEMIC_ROLES}><PracticeRubricEditorView publicId={publicId} /></RequireAuth>;
}
