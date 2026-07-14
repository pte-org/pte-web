import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/features/auth/constants";

// The Vendor portal has no public landing yet; send the root to the login page.
// An already-authenticated user is forwarded on to their role dashboard there.
export default function RootPage() {
  redirect(AUTH_ROUTES.login);
}
