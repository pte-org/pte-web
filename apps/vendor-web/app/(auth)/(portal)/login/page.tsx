import { Suspense } from "react";
import { AuthLoading, LoginView } from "@/features/auth/components";

// LoginView reads the `?role=` search param, which opts the tree into client
// rendering up to the nearest Suspense boundary — so wrap it in one.
export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginView />
    </Suspense>
  );
}
