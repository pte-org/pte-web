import type { ApiClient } from "../../client/client";
import type {
  PlanRequest,
  PlanResponse,
  PlanTransitionRequest,
  PlanUpdateRequest,
} from "../../types/billing";

export const PLAN_ENDPOINTS = {
  plans: "/api/v1/plans",
  plan: (publicId: string) => "/api/v1/plans/" + publicId,
  status: (publicId: string) => "/api/v1/plans/" + publicId + "/status",
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
  payload: PlanUpdateRequest,
): Promise<PlanResponse> {
  return client.request(PLAN_ENDPOINTS.plan(publicId), { method: "PUT", body: payload });
}

export function activatePlan(
  client: ApiClient,
  publicId: string,
  payload: PlanTransitionRequest,
): Promise<PlanResponse> {
  return client.request(PLAN_ENDPOINTS.status(publicId), { method: "PATCH", body: { action: "ACTIVATE", ...payload } });
}

export function archivePlan(
  client: ApiClient,
  publicId: string,
  payload: PlanTransitionRequest,
): Promise<PlanResponse> {
  return client.request(PLAN_ENDPOINTS.status(publicId), { method: "PATCH", body: { action: "ARCHIVE", ...payload } });
}

export function deletePlan(client: ApiClient, publicId: string): Promise<void> {
  return client.request(PLAN_ENDPOINTS.plan(publicId), { method: "DELETE" });
}
