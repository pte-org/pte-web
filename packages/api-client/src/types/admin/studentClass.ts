/** Matches admin's real `ClassStatus` enum. */
export type ClassStatusResponse = "ACTIVE" | "INACTIVE" | "SUSPENDED";

/** Matches admin's real `ClassResponse` record exactly. */
export interface ClassResponse {
  publicId: string;
  programPublicId: string;
  name: string;
  status: ClassStatusResponse;
}

/** Matches admin's real `CreateClassRequest` record exactly. */
export interface CreateClassRequest {
  name: string;
}

/** Matches admin's real `UpdateClassRequest` record exactly. */
export interface UpdateClassRequest {
  name: string;
}

/** Matches admin's real `AssignStudentRequest` record exactly. */
export interface AssignStudentRequest {
  studentPublicId: string;
}

/** Matches admin's real `BulkAssignStudentsRequest` record exactly. */
export interface BulkAssignStudentsRequest {
  studentPublicIds: string[];
}

/** Matches admin's real `BulkAssignStudentsResponse` record exactly. */
export interface BulkAssignStudentsResponse {
  assigned: string[];
  alreadyInClass: string[];
}

/** Matches admin's real `TransferStudentRequest` record exactly. */
export interface TransferStudentRequest {
  targetClassPublicId: string;
}

/**
 * Matches admin's real `ClassMembershipResponse` record exactly — one row
 * of a student's current Class assignment, doubling as both a single
 * assign/unassign/transfer result and one row of the tenant-wide
 * `GET /class-memberships` roster.
 */
export interface ClassMembershipResponse {
  publicId: string;
  classPublicId: string;
  className: string;
  programPublicId: string;
  programName: string;
  studentPublicId: string;
}

/** Matches admin's real `MergeClassesRequest` record exactly. */
export interface MergeClassesRequest {
  sourceClassPublicIds: string[];
}

/** Matches admin's real `MergeClassesResponse` record exactly. */
export interface MergeClassesResponse {
  targetClassPublicId: string;
  sourceClassPublicIds: string[];
  movedStudentPublicIds: string[];
}

/** Matches admin's real `SplitClassRequest` record exactly. */
export interface SplitClassRequest {
  newClassName: string;
  studentPublicIds: string[];
}

/** Matches admin's real `SplitClassResponse` record exactly. */
export interface SplitClassResponse {
  newClass: ClassResponse;
  movedStudentPublicIds: string[];
}
