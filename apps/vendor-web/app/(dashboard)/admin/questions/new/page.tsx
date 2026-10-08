import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { NewQuestionView } from "@/features/questionbank/components";

export default function NewQuestionPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <NewQuestionView />
    </RequireAuth>
  );
}
