import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { RubricVersionListView } from "@/features/scoringrubric/components/RubricVersionListView";

export default function ScoringRubricPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <RubricVersionListView />
    </RequireAuth>
  );
}
