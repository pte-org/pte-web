import { redirect } from "next/navigation";
import { AI_ADMIN_BASE_PATH } from "@/features/aiadmin/constants";

/** Question generation and chatbot usage are tabs of the AI overview now; an old link lands there. */
export default function ChatUsagePage(): never {
  redirect(AI_ADMIN_BASE_PATH);
}
