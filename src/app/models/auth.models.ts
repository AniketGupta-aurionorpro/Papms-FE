export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: Role;
  organizationId: number;
  enable: boolean;
}

export interface LoginResponseDto {
  accessToken: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  requiresPasswordChange?: boolean;
  organizationId?: number;
  organizationName?: string;
  employeeProfile?: CompleteEmployeeResponse;
}

export interface ForceChangePasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export enum Role {
  BANK_ADMIN = 'BANK_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  CLIENT = 'CLIENT'
}

export interface CompleteEmployeeResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  requiresPasswordChange?: boolean;
  isUserEnabled: boolean;
  profilePictureUrl?: string;
  organizationId: number;
  organizationName: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
  isEmployeeActive: boolean;
  bankAccount: BankAccountResponse;
  currentSalary: SalaryStructureResponse;
  createdAt: string;
}

export interface BankAccountResponse {
  id: number;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  isPrimary: boolean;
}

export interface SalaryStructureResponse {
  id: number;
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  totalSalary: number;
  effectiveFromDate: string;
  isActive: boolean;
}
