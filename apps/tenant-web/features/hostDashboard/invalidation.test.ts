import type { SessionResponse } from "@pte/api-client";
import {
  MutationObserver,
  QueryClient,
  type MutationObserverOptions,
} from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

/**
 * The seven mutation hooks that must refresh the host overview are executed for real through a
 * `QueryClient` and a `MutationObserver`: `useQueryClient` returns the test client and
 * `useMutation` only captures its options (so no React renderer is needed). The `@/` imports of
 * those modules are mapped to their real files, the network functions are mocks.
 */
const mocks = vi.hoisted(() => ({
  options: undefined as unknown,
  client: undefined as unknown,
  api: {
    bulkCreateUsers: vi.fn(),
    createClass: vi.fn(),
    createSession: vi.fn(),
    createExamDraft: vi.fn(),
    addAudienceSource: vi.fn(),
    preflightExam: vi.fn(),
    generateExam: vi.fn(),
    publishExam: vi.fn(),
  },
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: {} }));
vi.mock("@/features/exams/constants", async () => await import("../exams/constants"));
vi.mock("@/features/hostDashboard/constants", async () => await import("./constants"));
vi.mock("@/features/examoperations/errorMessage", async () => await import("../examoperations/errorMessage"));
vi.mock("@/features/examoperations/api", async () => await import("../examoperations/api"));
vi.mock("@/features/classes/api", async () => await import("../classes/api"));
vi.mock("@/features/studentSearch/constants", async () => await import("../studentSearch/constants"));
vi.mock("@/features/orgLabels/constants", async () => await import("../orgLabels/constants"));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  ...mocks.api,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => mocks.client,
  useMutation: (options: unknown) => {
    mocks.options = options;
    return {};
  },
  useQuery: () => ({}),
}));

import { useCreateRosterAccountsForClass } from "../classes/api/rosterImport";
import { useCreateClass } from "../classes/api";
import { OFFICIAL_EXAM_LOCKDOWN_MODE } from "../exams/constants";
import { useCreateExamWorkflow, useCreateSession } from "../exams/api";
import { useCreateRosterAccounts, useCreateStudent } from "../examoperations/api";
import { useCreateTenantStudents } from "../studentSearch/api";
import { HOST_DASHBOARD_QUERY_KEY } from "./constants";

let client: QueryClient;
let invalidate: MockInstance<QueryClient["invalidateQueries"]>;

beforeEach(() => {
  client = new QueryClient();
  mocks.client = client;
  invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined);
  for (const mock of Object.values(mocks.api)) mock.mockReset();
});

afterEach(() => client.clear());

type CapturedOptions = MutationObserverOptions<unknown, unknown, unknown, unknown>;

/** Runs the options captured from the last hook call; resolves whether the mutation succeeds or fails. */
async function runCaptured(variables: unknown): Promise<void> {
  const observer = new MutationObserver(client, mocks.options as CapturedOptions);
  await observer.mutate(variables).catch(() => undefined);
}

const dashboardInvalidations = (): number =>
  invalidate.mock.calls.filter(([filters]) => {
    const key = (filters as { queryKey?: readonly unknown[] } | undefined)?.queryKey;
    return key === HOST_DASHBOARD_QUERY_KEY;
  }).length;

// Only the fields the session mapper reads; the rest of SessionResponse is irrelevant here.
const sessionResponse = (lockdownMode = OFFICIAL_EXAM_LOCKDOWN_MODE): SessionResponse =>
  ({
    publicId: "11111111-1111-4111-8111-111111111111",
    sessionCode: "S-1",
    name: "Mock",
    subscriptionPublicId: "sub",
    snapshotPublicId: "snap",
    opensAt: "2026-10-20T01:00:00Z",
    closesAt: "2026-10-20T03:00:00Z",
    status: "SCHEDULED",
    capacity: 10,
    examMode: "OFFICIAL",
    policy: { lockdownMode },
    selectedSkills: [],
    maxRetriesPerStudent: 1,
  }) as unknown as SessionResponse;

const rosterRows = [{ email: "a@example.com", fullName: "A", studentCode: "", className: "", phone: "", dateOfBirth: "" }];
const created = { publicId: "p1", email: "a@example.com", generatedPassword: "x", fullName: "A" };

interface HookCase {
  name: string;
  /** Calls the hook (captures its options) and primes the network mocks. */
  useHook: (outcome: "success" | "failure") => void;
  variables: unknown;
}

const rejection = new Error("network down");

const HOOKS: HookCase[] = [
  {
    name: "useCreateRosterAccounts (roster import into a session)",
    useHook: (outcome) => {
      useCreateRosterAccounts("session-1");
      if (outcome === "success") mocks.api.bulkCreateUsers.mockResolvedValue({ created: [], skipped: [] });
      else mocks.api.bulkCreateUsers.mockRejectedValue(rejection);
    },
    variables: rosterRows,
  },
  {
    name: "useCreateStudent (add one learner)",
    useHook: (outcome) => {
      useCreateStudent();
      if (outcome === "success") mocks.api.bulkCreateUsers.mockResolvedValue({ created: [created], skipped: [] });
      else mocks.api.bulkCreateUsers.mockResolvedValue({ created: [], skipped: [{ reason: "duplicate" }] });
    },
    variables: { email: "a@example.com", fullName: "A" },
  },
  {
    name: "useCreateTenantStudents (students page)",
    useHook: (outcome) => {
      useCreateTenantStudents();
      if (outcome === "success") mocks.api.bulkCreateUsers.mockResolvedValue({ created: [created], skipped: [] });
      else mocks.api.bulkCreateUsers.mockRejectedValue(rejection);
    },
    variables: rosterRows,
  },
  {
    name: "useCreateRosterAccountsForClass (class roster import)",
    useHook: (outcome) => {
      useCreateRosterAccountsForClass();
      if (outcome === "success") mocks.api.bulkCreateUsers.mockResolvedValue({ created: [created], skipped: [] });
      else mocks.api.bulkCreateUsers.mockRejectedValue(rejection);
    },
    variables: rosterRows,
  },
  {
    name: "useCreateClass",
    useHook: (outcome) => {
      useCreateClass("org-1", "program-1");
      if (outcome === "success") mocks.api.createClass.mockResolvedValue({ publicId: "class-1" });
      else mocks.api.createClass.mockRejectedValue(rejection);
    },
    variables: { name: "Class A" },
  },
  {
    name: "useCreateSession",
    useHook: (outcome) => {
      useCreateSession();
      if (outcome === "success") mocks.api.createSession.mockResolvedValue(sessionResponse());
      else mocks.api.createSession.mockRejectedValue(rejection);
    },
    variables: {
      name: "Mock",
      subscriptionPublicId: "sub",
      skills: [],
      opensAt: "2026-10-20T01:00:00Z",
      closesAt: "2026-10-20T03:00:00Z",
      capacity: "10",
    },
  },
  {
    name: "useCreateExamWorkflow",
    useHook: (outcome) => {
      useCreateExamWorkflow();
      mocks.api.createExamDraft.mockResolvedValue(sessionResponse());
      mocks.api.addAudienceSource.mockResolvedValue(undefined);
      mocks.api.preflightExam.mockResolvedValue({ ready: true, issues: [] });
      mocks.api.generateExam.mockResolvedValue(undefined);
      if (outcome === "success") mocks.api.publishExam.mockResolvedValue(sessionResponse());
      else mocks.api.publishExam.mockRejectedValue(rejection);
    },
    variables: {
      name: "Mock",
      templatePublicId: "tpl",
      subscriptionPublicId: "sub",
      opensAt: "2026-10-20T01:00:00Z",
      closesAt: "2026-10-20T03:00:00Z",
      maxRetriesPerStudent: "1",
      formMode: "FIXED",
      reusePolicy: "ALLOW_REUSE",
      seriesKey: "",
      capacity: "10",
      sources: [{ sourceType: "CLASS", sourcePublicId: "class-1" }],
    },
  },
];

describe("mutations that change host overview counts invalidate the dashboard key", () => {
  it("covers all seven hooks", () => {
    expect(HOOKS).toHaveLength(7);
  });

  it.each(HOOKS)("$name refreshes the overview after it succeeds", async (hookCase) => {
    hookCase.useHook("success");
    await runCaptured(hookCase.variables);
    expect(dashboardInvalidations()).toBe(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["hostDashboard"] });
  });

  it.each(HOOKS)("$name leaves the overview alone when the request fails", async (hookCase) => {
    hookCase.useHook("failure");
    await runCaptured(hookCase.variables);
    expect(dashboardInvalidations()).toBe(0);
  });

  it("uses the shared key constant, whose value is the key of the overview query", () => {
    expect(HOST_DASHBOARD_QUERY_KEY).toEqual(["hostDashboard"]);
  });
});
