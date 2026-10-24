import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseJavaEnum,
  parseJavaSource,
  type JavaEnum,
  type JavaRecord,
  type JavaSource,
} from "./javaRecords";

/**
 * Locates and loads the pte-api `overview` records, and holds the hand-maintained tables the
 * contract test needs (nullable fields, enum-valued fields and maps). `javaWalker.ts` compares
 * fixtures against what is loaded here. Test support only: never exported from the package barrels.
 */

/** Overrides the backend source root (`.../app/src/main/java/com/pte`) for CI layouts. */
export const BACKEND_ROOT_ENV = "PTE_API_JAVA_DIR";
/** Set to `1` to make a missing backend a failure instead of a skip. */
export const BACKEND_REQUIRED_ENV = "PTE_API_REQUIRED";

const DEFAULT_BACKEND_ROOT = fileURLToPath(
  new URL("../../../../../../pte-api/app/src/main/java/com/pte", import.meta.url),
);

export const DTO_DIR = "overview/internal/dto/response";
export const CONSTANTS_FILE = "overview/internal/constant/OverviewConstants.java";

/** Facade records that the host response serialises as they are (not rebuilt by the overview module). */
export const SERIALISED_FACADE_FILES = ["session/UpcomingSessionView.java", "billing/CurrentSubscriptionView.java"];

/** Cache-only wrapper in the DTO package: never part of a response body. */
export const CACHE_ONLY_RECORDS: ReadonlySet<string> = new Set(["MonthlySeries"]);

export const JAVA_ENUM_FILES: Readonly<Record<string, string>> = {
  SectionStatus: `${DTO_DIR}/SectionStatus.java`,
  SessionStatus: "session/domain/enums/SessionStatus.java",
  PlanType: "billing/domain/enums/PlanType.java",
  SubscriptionStatus: "billing/domain/enums/SubscriptionStatus.java",
  ActivationSource: "billing/domain/enums/ActivationSource.java",
  QuestionStatus: "itembank/domain/enums/QuestionStatus.java",
  QuestionPool: "itembank/domain/enums/QuestionPool.java",
  PteSection: "itembank/domain/enums/PteSection.java",
  TicketCategory: "support/domain/enums/TicketCategory.java",
  OrganizationStatus: "tenancy/domain/enums/OrganizationStatus.java",
};

/**
 * Java reference-typed components that the facade documents as possibly null, which the TS
 * contract must therefore type as `| null`. A boxed Java type (`Integer`, `Long`, `Double`,
 * `Boolean`) that is not listed here fails the walk, so a new nullable field forces a review.
 */
export const NULLABLE_FIELDS: ReadonlySet<string> = new Set([
  "TrendValue.changePct",
  "UpcomingSessionView.capacity",
  "CurrentSubscriptionView.planName",
  "CurrentSubscriptionView.planType",
  "HostSectionData.Subscription.nearestExpiryAt",
  "HostSectionData.Subscription.daysToExpiry",
  "AdminSectionData.RecentTenant.planName",
  "AdminSectionData.RecentTenant.subscriptionExpiresAt",
  "AdminSectionData.OldestTicket.tenantName",
  "AdminSectionData.CurrencyRevenue.changePct",
]);

/** String components that carry an enum name, and which enum. */
export const ENUM_FIELDS: Readonly<Record<string, string>> = {
  "UpcomingSessionView.status": "SessionStatus",
  "CurrentSubscriptionView.planType": "PlanType",
  "CurrentSubscriptionView.status": "SubscriptionStatus",
  "AdminSectionData.RecentTenant.status": "OrganizationStatus",
  "AdminSectionData.OldestTicket.category": "TicketCategory",
};

/** `Map<String, Long>` components whose keys are exactly the constants of an enum. */
export const ENUM_KEYED_MAPS: Readonly<Record<string, string>> = {
  "HostSectionData.Exams.byStatus": "SessionStatus",
  "AdminSectionData.Subscriptions.activatedBySource": "ActivationSource",
  "AdminSectionData.Plans.byType": "PlanType",
  "AdminSectionData.QuestionBank.byStatus": "QuestionStatus",
  "AdminSectionData.QuestionBank.bySection": "PteSection",
  "AdminSectionData.QuestionBank.byPool": "QuestionPool",
  "AdminSectionData.QuestionBank.approvedByPool": "QuestionPool",
};

/** Maps keyed by stored data rather than an enum. */
export const FREE_KEY_MAPS: ReadonlySet<string> = new Set(["AdminSectionData.Tenants.byOrganizationType"]);

export interface RegistryEntry {
  record: JavaRecord;
  imports: string[];
}

export interface Backend {
  root: string;
  read(relativePath: string): string;
  readRecords(relativePath: string): JavaSource;
  /** Every record of the DTO package and the serialised facade files, by qualified name. */
  registry: Map<string, RegistryEntry>;
  /** Names of the DTO package records only (qualified), for the reachability check. */
  dtoRecordNames: string[];
  enums: Map<string, JavaEnum>;
}

export function backendRoot(): string {
  return process.env[BACKEND_ROOT_ENV] ?? DEFAULT_BACKEND_ROOT;
}

export function backendRequired(): boolean {
  return process.env[BACKEND_REQUIRED_ENV] === "1";
}

/**
 * Cheap presence check (no parsing) usable at collection time to decide skip vs run; the parsing
 * itself belongs in `loadBackend()` inside a `beforeAll`, so a parser error fails the suite with a
 * clear message instead of failing the file at import.
 */
export function backendPresent(): boolean {
  return existsSync(join(backendRoot(), DTO_DIR));
}

export function loadBackend(): Backend | null {
  const root = backendRoot();
  if (!backendPresent()) return null;

  const read = (relativePath: string): string => readFileSync(join(root, relativePath), "utf8");
  const readRecords = (relativePath: string): JavaSource => parseJavaSource(read(relativePath));

  const registry = new Map<string, RegistryEntry>();
  const dtoRecordNames: string[] = [];
  const dtoFiles = readdirSync(join(root, DTO_DIR)).filter((file) => file.endsWith(".java"));
  for (const file of dtoFiles) {
    const source = readRecords(`${DTO_DIR}/${file}`);
    for (const record of source.records) {
      registry.set(record.qualifiedName, { record, imports: source.imports });
      dtoRecordNames.push(record.qualifiedName);
    }
  }
  for (const file of SERIALISED_FACADE_FILES) {
    const source = readRecords(file);
    for (const record of source.records) registry.set(record.qualifiedName, { record, imports: source.imports });
  }

  const enums = new Map<string, JavaEnum>();
  for (const [name, file] of Object.entries(JAVA_ENUM_FILES)) {
    const parsed = parseJavaEnum(read(file));
    if (parsed === null) throw new Error(`No enum found in ${file}`);
    if (parsed.name !== name) throw new Error(`Expected enum ${name} in ${file}, found ${parsed.name}`);
    enums.set(name, parsed);
  }
  return { root, read, readRecords, registry, dtoRecordNames, enums };
}

/** Resolves a type name written inside `from`'s file to a registered record. */
export function resolveRecord(backend: Backend, typeName: string, from: RegistryEntry): RegistryEntry | undefined {
  const direct = backend.registry.get(typeName);
  if (typeName.includes(".") && direct) return direct;
  if (from.record.outer !== null) {
    const sibling = backend.registry.get(`${from.record.outer}.${typeName}`);
    if (sibling) return sibling;
  }
  for (const imported of from.imports) {
    if (!imported.endsWith(`.${typeName}`)) continue;
    const segments = imported.split(".");
    const nested = backend.registry.get(segments.slice(-2).join("."));
    if (nested) return nested;
  }
  return direct;
}

