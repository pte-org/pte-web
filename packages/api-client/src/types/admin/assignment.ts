/** Matches admin's real `LecturerAssignmentResponse` record exactly. */
export interface LecturerAssignmentResponse {
  publicId: string;
  classPublicId: string;
  assigneePublicId: string;
}

/** Matches admin's real `AssignLecturerRequest` record exactly. */
export interface AssignLecturerRequest {
  assigneePublicId: string;
}
