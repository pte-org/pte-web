/** Matches admin's real `LecturerAssignmentResponse` record exactly. */
export interface LecturerAssignmentResponse {
  publicId: string;
  classPublicId: string;
  assigneePublicId: string;
}

/** Matches admin's real `ProgramCoordinatorAssignmentResponse` record exactly. */
export interface ProgramCoordinatorAssignmentResponse {
  publicId: string;
  programPublicId: string;
  assigneePublicId: string;
}

/** Matches admin's real `AssignLecturerRequest` record exactly. */
export interface AssignLecturerRequest {
  assigneePublicId: string;
}

/** Matches admin's real `AssignCoordinatorRequest` record exactly. */
export interface AssignCoordinatorRequest {
  assigneePublicId: string;
}
