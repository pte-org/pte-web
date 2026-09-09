export interface CreateProgramInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CreateProgramErrors {
  name?: string;
}
