import { describe, expect, it } from "vitest";
import * as requests from "./index";

/**
 * Guards the flat `/api/` prefix contract that the modulith collapse
 * established (ADR-008, and plans/quang-web-billing-integration Phase 1).
 *
 * Two independent failure modes this catches, both of which are silent 404s
 * at runtime rather than compile errors:
 *
 *  1. A path that reintroduces a per-service segment (`/api/iam/...`,
 *     `/api/scheduling/...`). Those services stopped existing; the edge
 *     strips exactly one `/api` segment, so anything else 404s.
 *  2. A path that drops `/api` entirely. That collides with the Next.js UI
 *     routes served from the same origin — see deploy/api-routes.caddy.
 */

/** Service names from the pre-modulith routing table — none may reappear. */
const RETIRED_SERVICE_SEGMENTS = [
  "iam",
  "admin",
  "authoring",
  "scheduling",
  "exam-delivery",
  "proctor",
  "scoring",
  "reporting",
  "notification",
  "media",
] as const;

/**
 * `/api/v1/assets/upload` — deliberately excluded. It is backed by no
 * controller anywhere in pte-api (MediaController serves `/objects` with a
 * completely different presign flow) and is unused by either app, same as
 * `AUTH_ENDPOINTS.changePassword`. Kept as a known-fictitious path rather
 * than silently "fixed" into something that looks real but still 404s.
 */
const KNOWN_FICTITIOUS_PATHS = new Set(["/api/v1/assets/upload"]);

/** Collects every concrete path string from the `*_ENDPOINTS` const objects. */
function collectEndpointPaths(): { name: string; path: string }[] {
  const collected: { name: string; path: string }[] = [];

  for (const [exportName, exported] of Object.entries(requests)) {
    if (!exportName.endsWith("_ENDPOINTS") || typeof exported !== "object" || exported === null) {
      continue;
    }

    for (const [key, value] of Object.entries(exported as Record<string, unknown>)) {
      const label = `${exportName}.${key}`;
      if (typeof value === "string") {
        collected.push({ name: label, path: value });
      } else if (typeof value === "function") {
        // Path builders take only id-ish params; feeding each a placeholder
        // yields a representative concrete path without needing to know the
        // arity precisely (extra args are ignored by the builders).
        const built = (value as (...args: string[]) => unknown)("id-1", "id-2", "id-3");
        if (typeof built === "string") collected.push({ name: label, path: built });
      }
    }
  }

  return collected;
}

describe("api-client endpoint paths", () => {
  const paths = collectEndpointPaths();

  it("finds endpoint constants to check", () => {
    // Guards the reflection above: if the `*_ENDPOINTS` naming convention
    // ever changes, every other assertion here would vacuously pass.
    expect(paths.length).toBeGreaterThan(30);
  });

  it.each(paths)("$name starts with the /api prefix", ({ path }) => {
    expect(path.startsWith("/api/")).toBe(true);
  });

  it.each(paths.filter(({ path }) => !KNOWN_FICTITIOUS_PATHS.has(path)))(
    "$name carries no retired service segment",
    ({ path }) => {
      const [, , firstSegment] = path.split("/");
      expect(RETIRED_SERVICE_SEGMENTS).not.toContain(firstSegment);
    },
  );
});
