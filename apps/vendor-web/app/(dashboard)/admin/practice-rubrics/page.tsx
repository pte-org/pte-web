import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { PracticeRubricListView } from "@/features/practicerubric/components";

export default function PracticeRubricsPage() {
  return <RequireAuth allowedRoles={ACADEMIC_ROLES}><PracticeRubricListView /></RequireAuth>;
}
