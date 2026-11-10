import { Suspense } from "react";
import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { NewQuestionView } from "@/features/questionbank/components";

export default function NewQuestionPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      {/* The form reads ?fromJob= to take back a question an AI run wrote. */}
      <Suspense>
        <NewQuestionView />
      </Suspense>
    </RequireAuth>
  );
}
