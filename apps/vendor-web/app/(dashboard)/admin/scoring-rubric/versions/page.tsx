import type { ReactElement } from "react";
import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { RubricVersionListView } from "@/features/scoringrubric/components/RubricVersionListView";

const RubricVersionsPage = (): ReactElement => <RequireAuth allowedRoles={ACADEMIC_ROLES}><RubricVersionListView /></RequireAuth>;
export default RubricVersionsPage;
