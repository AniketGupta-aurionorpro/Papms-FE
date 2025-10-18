import { Role } from "./enums/role.enum";

export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: Role;
  organizationId: number;
  isActive: boolean;
  requiresPasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponseDto {
  accessToken: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  organizationId?: number;
  organizationName?: string;
  employeeProfile?: CompleteEmployeeResponse;
}

export interface CompleteEmployeeResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
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
