export interface ColumnMappingSuggestion {
  sourceColumn: string;
  targetField: string;
  confidence: number;
}

export interface ParseFileResponse {
  importId: string;
  columnHeaders: string[];
  sampleRows: Record<string, string>[];
  estimatedRowCount: number;
  expiresAt: string;
}

export interface PrepareImportRequest {
  fileName: string;
  columnHeaders: string[];
  rows: Record<string, string>[];
}

export interface UsernamePatternConfig {
  type: "AUTO_INCREMENT" | "EMAIL_PREFIX" | "STUDENT_CODE";
  sourceColumn: string | null;
}

export interface PreviewRequest {
  importId: string;
  columnMappings: Record<string, string>;
  usernamePatternConfig: UsernamePatternConfig;
}

export interface RowError {
  field: string;
  message: string;
}

export interface PreviewRow {
  rowNumber: number;
  generatedUsername: string;
  usernameBase: string;
  fieldValues: Record<string, string>;
  errorCode: string | null;
  warningCodes: string[];
  hasError: boolean;
}

export interface PreviewResponse {
  rows: PreviewRow[];
  totalRows: number;
  errorCount: number;
  hasErrors: boolean;
  usernameStrategyFallbackCount: number;
}

export interface RosterImportRequest {
  filename: string;
  validRows: PreviewRow[];
  errors: RowError[];
}

export interface RosterImportResponse {
  batchId: number;
  filename: string;
  totalRows: number;
  importedRows: number;
  errorRows: number;
  createdAt: string;
}

export interface ExamResponse {
  id: number;
  name: string;
  code: string;
  isAssignable: boolean;
}

export interface AssignExamRequest {
  examId: number;
}

export interface AssignExamResponse {
  batchId: number;
  examId: number;
  assignedCount: number;
}
