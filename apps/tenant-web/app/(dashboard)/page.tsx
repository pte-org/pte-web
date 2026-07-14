import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/features/auth/constants";

// No public landing on the Tenant portal yet; send the root to the login page.
export default function RootPage() {
  redirect(AUTH_ROUTES.login);
}
