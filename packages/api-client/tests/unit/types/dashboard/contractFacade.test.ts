import { beforeAll, describe, expect, it } from "vitest";
import { backendPresent, backendRoot, loadBackend, type Backend } from "./javaContract";
import { jsonKind } from "./javaWalker";

/**
 * Every facade record that a response record is built from must reach the response (under the
 * documented rename) with a compatible JSON kind. A dropped or renamed backend field is caught here
 * even when the response fixture was not touched. Skipped without the pte-api sources, like
 * `contract.test.ts`.
 */

// Presence is decided at collection time (cheap); the Java parsing happens in beforeAll so a parser
// error fails the suite with a clear message instead of failing the file at import.
const present = backendPresent();
let backend: Backend | null = null;

beforeAll(() => {
  if (present) backend = loadBackend();
});

function need(): Backend {
  if (!backend) throw new Error(`pte-api sources not found at ${backendRoot()}`);
  return backend;
}

describe.skipIf(!present)("facade records feed the dashboard records", () => {
  /** Facade record (file, name) -> response record, with the renames the overview module applies. */
  const MAPPINGS = [
    { file: "tenancy/RecentTenantView.java", source: "RecentTenantView", target: "AdminSectionData.RecentTenant", renames: { publicId: "tenantId", studentLimit: "seatLimit" } },
    { file: "tenancy/TenantSeatLimit.java", source: "TenantSeatLimit", target: "AdminSectionData.SeatUtilisation", renames: { publicId: "tenantId", studentLimit: "seatLimit" } },
    { file: "tenancy/PlatformTenantCounts.java", source: "PlatformTenantCounts", target: "AdminSectionData.Tenants" },
    { file: "tenancy/StudentQuota.java", source: "StudentQuota", target: "HostSectionData.Quota", renames: { current: "used" } },
    { file: "billing/BillingOverviewService.java", source: "LicenseCounts", target: "AdminSectionData.Licenses" },
    { file: "billing/BillingOverviewService.java", source: "SubscriptionCounts", target: "AdminSectionData.Subscriptions" },
    { file: "billing/BillingOverviewService.java", source: "PlanCounts", target: "AdminSectionData.Plans" },
    { file: "billing/BillingOverviewService.java", source: "PendingApplicationView", target: "AdminSectionData.PendingApplication", renames: { publicId: "applicationId" } },
    { file: "billing/BillingOverviewService.java", source: "TenantPlanBrief", target: "AdminSectionData.RecentTenant", renames: { expiresAt: "subscriptionExpiresAt" } },
    { file: "billing/BillingOverviewService.java", source: "SubscriptionSummary", target: "HostSectionData.Subscription" },
    { file: "billing/BillingRevenueOverviewService.java", source: "CurrencyPaidTotal", target: "AdminSectionData.CurrencyRevenue", renames: { amount: "current" }, kindExceptions: ["paidOrders"] },
    { file: "support/SupportOverviewService.java", source: "TicketCounts", target: "HostSectionData.Support" },
    { file: "support/SupportOverviewService.java", source: "TicketCounts", target: "AdminSectionData.Support", notExposed: ["resolvedAwaitingClose"] },
    { file: "support/SupportOverviewService.java", source: "OpenTicketBrief", target: "AdminSectionData.OldestTicket", renames: { publicId: "ticketId" } },
    { file: "identity/IdentityOverviewService.java", source: "StudentStatusCounts", target: "HostSectionData.Learners" },
    { file: "identity/IdentityOverviewService.java", source: "StaffCounts", target: "HostSectionData.Staff" },
    { file: "itembank/ItembankOverviewService.java", source: "QuestionBankCounts", target: "AdminSectionData.QuestionBank" },
    { file: "scoring/ScoringOverviewService.java", source: "ScoringBacklog", target: "HostSectionData.Grading" },
    { file: "enrollment/EnrollmentOverviewService.java", source: "AcademicCounts", target: "HostSectionData.Academics", notExposed: ["assignedLearners"] },
  ] as { file: string; source: string; target: string; renames?: Record<string, string>; notExposed?: string[]; kindExceptions?: string[] }[];

  it.each(MAPPINGS.map((mapping) => [`${mapping.source} -> ${mapping.target}`, mapping] as const))(
    "%s: every facade component reaches the response with a compatible JSON kind",
    (_label, mapping) => {
      const source = need().readRecords(mapping.file).records.find((record) => record.name === mapping.source);
      const target = need().registry.get(mapping.target)?.record;
      expect(source, `${mapping.source} in ${mapping.file}`).toBeDefined();
      expect(target, mapping.target).toBeDefined();

      const problems: string[] = [];
      for (const component of source?.components ?? []) {
        if (mapping.notExposed?.includes(component.name)) continue;
        const targetName = mapping.renames?.[component.name] ?? component.name;
        const targetComponent = target?.components.find((candidate) => candidate.name === targetName);
        if (!targetComponent) {
          problems.push(`${mapping.source}.${component.name} is not exposed as ${mapping.target}.${targetName}`);
        } else if (
          !mapping.kindExceptions?.includes(component.name) &&
          jsonKind(component.type) !== jsonKind(targetComponent.type)
        ) {
          problems.push(
            `${mapping.source}.${component.name} (${jsonKind(component.type)}) vs ${mapping.target}.${targetName} (${jsonKind(targetComponent.type)})`,
          );
        }
      }
      expect(problems).toEqual([]);
    },
  );

  it("lists every record of the facade files it maps from (a new facade record needs a mapping decision)", () => {
    const mappedByFile = new Map<string, Set<string>>();
    for (const mapping of MAPPINGS) {
      mappedByFile.set(mapping.file, (mappedByFile.get(mapping.file) ?? new Set()).add(mapping.source));
    }
    const unmapped: string[] = [];
    for (const [file, names] of mappedByFile) {
      for (const record of need().readRecords(file).records) {
        if (!names.has(record.name)) unmapped.push(`${file}#${record.name}`);
      }
    }
    expect(unmapped).toEqual([]);
  });
});

