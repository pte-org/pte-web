import { notFound } from "next/navigation";
import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { PromptDetailView, PromptWorkspaceView } from "@/features/aiadmin/components";
import { EDITABLE_PROMPT_CATEGORIES } from "@/features/aiadmin/promptEditConstants";
import { PROMPT_CATEGORIES } from "@/features/aiadmin/promptConstants";

interface AiPromptDetailPageProps {
  params: Promise<{ category: string; key: string }>;
}

export default async function AiPromptDetailPage({ params }: AiPromptDetailPageProps) {
  const { category, key } = await params;
  const known = PROMPT_CATEGORIES.find((name) => name === category);
  if (!known) notFound();

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      {EDITABLE_PROMPT_CATEGORIES.includes(known) ? (
        <PromptWorkspaceView category={known} promptKey={decodeURIComponent(key)} />
      ) : (
        <PromptDetailView category={known} promptKey={decodeURIComponent(key)} />
      )}
    </RequireAuth>
  );
}
