import { ChangePasswordView, RequireAuth } from "@/features/auth/components";

export default function ChangePasswordPage() {
  return (
    <RequireAuth>
      <ChangePasswordView />
    </RequireAuth>
  );
}
