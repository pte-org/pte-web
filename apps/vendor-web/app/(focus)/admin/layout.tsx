import type { ReactNode } from "react";
import { FocusChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";

const QUESTION_BANK_HREF = "/admin/questions";
const BACK_TO_BANK = "Back to the question bank";

/** AI generation runs open full screen: no sidebar or header, only the way back to the question bank. */
export default function FocusAdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <FocusChrome allowedRoles={ADMIN_ROLES} backHref={QUESTION_BANK_HREF} backLabel={BACK_TO_BANK}>
      {children}
    </FocusChrome>
  );
}
