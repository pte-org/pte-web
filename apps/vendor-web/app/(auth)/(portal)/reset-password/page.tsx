import { Suspense } from "react";
import { AuthLoading, ResetPasswordView } from "@/features/auth/components";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ResetPasswordView />
    </Suspense>
  );
}
