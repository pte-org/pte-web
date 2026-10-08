import { redirect } from "next/navigation";

/**
 * Proctor workspace index.
 *
 * Mirrors `apps/tenant-web/app/(dashboard)/examiner/page.tsx`. Pro enters
 * deep-linking views (`/proctor/sessions/{publicId}` or
 * `/proctor/audit-log/{publicId}`) from the host UI; `/proctor/profile` is
 * the only self-service landing.
 */
export default function ProctorIndexPage(): never {
  redirect("/proctor/profile");
}