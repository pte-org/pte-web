import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { QuestionTypeView } from "@/features/questiontemplate";

export default function QuestionTypesPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <QuestionTypeView />
    </RequireAuth>
  );
}
