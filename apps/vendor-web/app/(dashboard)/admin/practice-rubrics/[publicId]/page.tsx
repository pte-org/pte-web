import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { PracticeRubricDetailView } from "@/features/practicerubric/components";

interface Props { params: Promise<{ publicId: string }> }

export default async function PracticeRubricDetailPage({ params }: Props) {
  const { publicId } = await params;
  return <RequireAuth allowedRoles={ACADEMIC_ROLES}><PracticeRubricDetailView publicId={publicId} /></RequireAuth>;
}
