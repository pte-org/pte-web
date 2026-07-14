export type StudentStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface HostStudentResponse {
  id: number;
  username: string;
  fullName?: string | null;
  studentCode?: string | null;
  className?: string | null;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  status: StudentStatus;
  createdAt: string;
}
