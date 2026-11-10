import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { BackLink } from "@/lib/BackLink";
import { QuestionTypeView } from "@/features/questiontemplate";

export default function QuestionTypesPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <div className="space-y-4">
        <BackLink />
        <QuestionTypeView />
      </div>
    </RequireAuth>
  );
}
