import type { ApiClient } from "../../client/client";
import type { PlanRequest, PlanResponse } from "../../types/billing";

export const PLAN_ENDPOINTS = {
  plans: "/api/v1/plans",
  plan: (publicId: string) => "/api/v1/plans/" + publicId,
  activate: (publicId: string) => "/api/v1/plans/" + publicId + "/activation",
  archive: (publicId: string) => "/api/v1/plans/" + publicId + "/archive",
} as const;

export function listPlans(client: ApiClient): Promise<PlanResponse[]> {
  return client.request(PLAN_ENDPOINTS.plans);
}

export function getPlan(client: ApiClient, publicId: string): Promise<PlanResponse> {
  return client.request(PLAN_ENDPOINTS.plan(publicId));
}

export function createPlan(client: ApiClient, payload: PlanRequest): Promise<PlanResponse> {
  return client.request(PLAN_ENDPOINTS.plans, { method: "POST", body: payload });
}

export function updatePlan(
  client: ApiClient,
  publicId: string,
  payload: PlanRequest,
): Promise<PlanResponse> {
  return client.request(PLAN_ENDPOINTS.plan(publicId), { method: "PUT", body: payload });
}

export function activatePlan(client: ApiClient, publicId: string): Promise<PlanResponse> {
  return client.request(PLAN_ENDPOINTS.activate(publicId), { method: "POST" });
}

export function archivePlan(client: ApiClient, publicId: string): Promise<PlanResponse> {
  return client.request(PLAN_ENDPOINTS.archive(publicId), { method: "POST" });
}
