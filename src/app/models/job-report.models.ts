export interface FailedEmployeeRecord {
  rowNumber: number;
  rowData: { [key: string]: string };
  errorMessage: string;
}

export interface JobReport {
  id: number;
  jobExecutionId: number;
  organizationName: string;
  jobName: string;
  status: 'COMPLETED' | 'FAILED' | 'STARTING' | 'STARTED';
  totalRecordsRead: number;
  successfulImports: number;
  failedImports: number;
  createdAt: string; // ISO date string
  failedRecords?: FailedEmployeeRecord[]; // Optional, only present in detailed view
}

// For paginated responses from the API
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // Current page number
  size: number;
}
