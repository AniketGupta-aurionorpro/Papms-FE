export interface DocumentResponseDto {
  id: number;
  fileName: string;
  url: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadedAt: string;
}

export enum DocumentType {
  ORGANIZATION_VERIFICATION = 'ORGANIZATION_VERIFICATION'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
