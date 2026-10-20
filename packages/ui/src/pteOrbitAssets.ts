import { readFile } from "node:fs/promises";
import path from "node:path";

const PTE_ORBIT_ASSET_DIRECTORY = path.resolve(
  process.cwd(),
  "../../packages/ui/src/assets/pte-orbit",
);

const PTE_ORBIT_ASSETS = {
  "bootstrap.js": "text/javascript; charset=utf-8",
  "constants.js": "text/javascript; charset=utf-8",
  "index.html": "text/html; charset=utf-8",
  "logo.js": "text/javascript; charset=utf-8",
  "models.js": "text/javascript; charset=utf-8",
  "primitives.js": "text/javascript; charset=utf-8",
  "scene.js": "text/javascript; charset=utf-8",
  "styles.css": "text/css; charset=utf-8",
} as const;

export type PteOrbitAssetName = keyof typeof PTE_ORBIT_ASSETS;

export const servePteOrbitAsset = async (assetName: string): Promise<Response> => {
  if (!(assetName in PTE_ORBIT_ASSETS)) {
    return new Response("Not found", { status: 404 });
  }

  const asset = assetName as PteOrbitAssetName;
  try {
    const content = await readFile(path.join(PTE_ORBIT_ASSET_DIRECTORY, asset), "utf8");
    return new Response(content, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": PTE_ORBIT_ASSETS[asset],
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};
