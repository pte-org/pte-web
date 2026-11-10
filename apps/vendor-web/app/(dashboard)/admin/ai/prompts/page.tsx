import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { PromptsView } from "@/features/aiadmin/components";

export default function AiPromptsPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <PromptsView />
    </RequireAuth>
  );
}
