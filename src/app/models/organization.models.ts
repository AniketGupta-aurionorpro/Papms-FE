export interface OrganizationRegistrationReq {
  companyName: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  address: string;
  contactNumber: string;
}

export interface OrganizationResponseDto {
  id: number;
  companyName: string;
  address: string;
  contactEmail: string;
  logoUrl: string;
  status: OrganizationStatus;
  bankAssignedAccountNumber: string;
  internalBalance: number;
  createdAt: string;
  documents: DocumentResponseDto[];
}

export interface OrganizationResponseDtowithEmployee extends OrganizationResponseDto {
  employees: EmployeeResponseDto[];
}

export interface OrganizationProfileResponse {
  id: number;
  companyName: string;
  email: string;
  logoUrl: string;
  status: string;
}

export interface FinancialSummaryDto {
  organizationId: number;
  organizationName: string;
  organizationStatus: string;
  currentBalance: number;
  totalCredits: number;
  totalDebits: number;
  totalTransactions: number;
  firstTransactionDate: string;
  lastTransactionDate: string;
}

export enum OrganizationStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export interface OrganizationRegistrationReq {
  companyName: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  address: string;
  contactNumber: string;
}

export interface OrganizationResponseDto {
  id: number;
  companyName: string;
  address: string;
  contactEmail: string;
  logoUrl: string;
  status: OrganizationStatus;
  bankAssignedAccountNumber: string;
  internalBalance: number;
  createdAt: string;
  documents: DocumentResponseDto[];
}

export interface OrganizationResponseDtowithEmployee extends OrganizationResponseDto {
  employees: EmployeeResponseDto[];
}

export interface OrganizationProfileResponse {
  id: number;
  companyName: string;
  email: string;
  logoUrl: string;
  status: string;
}

export interface DocumentResponseDto {
  id: number;
  fileName: string;
  url: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadedAt: string;
}

export interface EmployeeResponseDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isUserEnabled: boolean;
  organizationId: number;
  organizationName: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
  isEmployeeActive: boolean;
}


export enum DocumentType {
  ORGANIZATION_VERIFICATION = 'ORGANIZATION_VERIFICATION'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
