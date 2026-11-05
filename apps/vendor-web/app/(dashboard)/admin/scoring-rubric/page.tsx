import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { RubricTaskTypeListView } from "@/features/scoringrubric/components";

export default function ScoringRubricPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <RubricTaskTypeListView />
    </RequireAuth>
  );
}
