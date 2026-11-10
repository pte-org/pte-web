import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ publicId: string }>;
}

/** Old live-monitoring link: the session now opens on its attendance tab. */
export default async function ProctorSessionDetailPage({ params }: PageProps): Promise<never> {
  const { publicId } = await params;
  redirect(`/proctor/attendance/${encodeURIComponent(publicId)}`);
}
