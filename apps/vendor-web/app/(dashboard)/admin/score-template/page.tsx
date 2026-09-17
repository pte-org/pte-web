import { DashboardChrome } from "@/features/auth/components";
import { ADMIN_ROLES } from "@/features/auth/constants";
import { ScoreTemplateListView } from "@/features/scoretemplate/components";
import { ADMIN_NAV } from "@/lib/navigation";

export default function ScoreTemplatePage() {
  return (
    <DashboardChrome navItems={ADMIN_NAV} allowedRoles={ADMIN_ROLES}>
      <ScoreTemplateListView />
    </DashboardChrome>
  );
}
