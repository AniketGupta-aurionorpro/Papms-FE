export interface RaiseConcernRequest {
  subject: string;
  description: string;
}

export interface ConcernResponseDto {
  id: number;
  subject: string;
  description: string;
  status: ConcernStatus;
  createdAt: string;
  updatedAt: string;
  resolutionNotes: string;
  employeeId: number;
  employeeName: string;
  resolvedByAdminName: string;
}

export interface UpdateConcernStatusRequest {
  status: ConcernStatus;
  resolutionNotes: string;
}

export enum ConcernStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}
