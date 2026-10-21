import { servePteOrbitAsset } from "@pte/ui/pte-orbit-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> },
): Promise<Response> {
  const { asset } = await params;
  return servePteOrbitAsset(asset);
}
