export interface EmployeeDashboardDto {
  employeeProfile: CompleteEmployeeResponse;
  latestPayslip: LatestPayslipDto;
}

export interface LatestPayslipDto {
  paymentId: number;
  period: string;
  netSalary: number;
}

export interface CompleteEmployeeResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isUserEnabled: boolean;
  profilePictureUrl: string;
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
