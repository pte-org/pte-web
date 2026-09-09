import type { ApiClient } from "../../client/client";
import type {
  AssignStudentRequest,
  BulkAssignStudentsRequest,
  BulkAssignStudentsResponse,
  ClassMembershipResponse,
  ClassResponse,
  CreateClassRequest,
  MergeClassesRequest,
  MergeClassesResponse,
  SplitClassRequest,
  SplitClassResponse,
  TransferStudentRequest,
  UpdateClassRequest,
} from "../../types/admin/studentClass";

function basePath(organizationPublicId: string, programPublicId: string): string {
  return `/api/admin/organizations/${organizationPublicId}/programs/${programPublicId}/classes`;
}

export const CLASS_ENDPOINTS = {
  classes: basePath,
  class: (organizationPublicId: string, programPublicId: string, publicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${publicId}`,
  activate: (organizationPublicId: string, programPublicId: string, publicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${publicId}/activate`,
  deactivate: (organizationPublicId: string, programPublicId: string, publicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${publicId}/deactivate`,
  suspend: (organizationPublicId: string, programPublicId: string, publicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${publicId}/suspend`,
  archive: (organizationPublicId: string, programPublicId: string, publicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${publicId}/archive`,
  students: (organizationPublicId: string, programPublicId: string, classPublicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${classPublicId}/students`,
  studentsBulk: (organizationPublicId: string, programPublicId: string, classPublicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${classPublicId}/students/bulk`,
  student: (organizationPublicId: string, programPublicId: string, classPublicId: string, membershipPublicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${classPublicId}/students/${membershipPublicId}`,
  transfer: (organizationPublicId: string, programPublicId: string, classPublicId: string, membershipPublicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${classPublicId}/students/${membershipPublicId}/transfer`,
  merge: (organizationPublicId: string, programPublicId: string, targetClassPublicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${targetClassPublicId}/merge`,
  split: (organizationPublicId: string, programPublicId: string, sourceClassPublicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${sourceClassPublicId}/split`,
} as const;

export function listClasses(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
): Promise<ClassResponse[]> {
  return client.request<ClassResponse[]>(CLASS_ENDPOINTS.classes(organizationPublicId, programPublicId));
}

export function createClass(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  payload: CreateClassRequest,
): Promise<ClassResponse> {
  return client.request<ClassResponse>(CLASS_ENDPOINTS.classes(organizationPublicId, programPublicId), {
    method: "POST",
    body: payload,
  });
}

export function updateClass(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  publicId: string,
  payload: UpdateClassRequest,
): Promise<ClassResponse> {
  return client.request<ClassResponse>(CLASS_ENDPOINTS.class(organizationPublicId, programPublicId, publicId), {
    method: "PUT",
    body: payload,
  });
}

export function activateClass(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  publicId: string,
): Promise<ClassResponse> {
  return client.request<ClassResponse>(CLASS_ENDPOINTS.activate(organizationPublicId, programPublicId, publicId), {
    method: "POST",
  });
}

export function deactivateClass(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  publicId: string,
): Promise<ClassResponse> {
  return client.request<ClassResponse>(CLASS_ENDPOINTS.deactivate(organizationPublicId, programPublicId, publicId), {
    method: "POST",
  });
}

export function suspendClass(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  publicId: string,
): Promise<ClassResponse> {
  return client.request<ClassResponse>(CLASS_ENDPOINTS.suspend(organizationPublicId, programPublicId, publicId), {
    method: "POST",
  });
}

export function archiveClass(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  publicId: string,
): Promise<ClassResponse> {
  return client.request<ClassResponse>(CLASS_ENDPOINTS.archive(organizationPublicId, programPublicId, publicId), {
    method: "POST",
  });
}

export function assignStudent(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
  payload: AssignStudentRequest,
): Promise<ClassMembershipResponse> {
  return client.request<ClassMembershipResponse>(
    CLASS_ENDPOINTS.students(organizationPublicId, programPublicId, classPublicId),
    { method: "POST", body: payload },
  );
}

export function bulkAssignStudents(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
  payload: BulkAssignStudentsRequest,
): Promise<BulkAssignStudentsResponse> {
  return client.request<BulkAssignStudentsResponse>(
    CLASS_ENDPOINTS.studentsBulk(organizationPublicId, programPublicId, classPublicId),
    { method: "POST", body: payload },
  );
}

export function unassignStudent(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
  membershipPublicId: string,
): Promise<void> {
  return client.request<void>(
    CLASS_ENDPOINTS.student(organizationPublicId, programPublicId, classPublicId, membershipPublicId),
    { method: "DELETE" },
  );
}

export function transferStudent(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
  membershipPublicId: string,
  payload: TransferStudentRequest,
): Promise<ClassMembershipResponse> {
  return client.request<ClassMembershipResponse>(
    CLASS_ENDPOINTS.transfer(organizationPublicId, programPublicId, classPublicId, membershipPublicId),
    { method: "POST", body: payload },
  );
}

export function mergeClasses(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  targetClassPublicId: string,
  payload: MergeClassesRequest,
): Promise<MergeClassesResponse> {
  return client.request<MergeClassesResponse>(
    CLASS_ENDPOINTS.merge(organizationPublicId, programPublicId, targetClassPublicId),
    { method: "POST", body: payload },
  );
}

export function splitClass(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  sourceClassPublicId: string,
  payload: SplitClassRequest,
): Promise<SplitClassResponse> {
  return client.request<SplitClassResponse>(
    CLASS_ENDPOINTS.split(organizationPublicId, programPublicId, sourceClassPublicId),
    { method: "POST", body: payload },
  );
}
