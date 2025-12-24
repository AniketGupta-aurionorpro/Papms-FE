export interface EmployeeRequestDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  organizationId: number;
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

export interface AddEmployeeRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
}

export interface UpdateEmployeeRequest {
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  bankAccount: UpdateBankAccountRequest;
}

export interface UpdateBankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface CompleteEmployeeRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
  bankAccount: BankAccountRequest;
  salaryStructure: SalaryStructureRequest;
}

export interface BankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface SalaryStructureRequest {
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  effectiveFromDate: string;
}

export interface UpdateSalaryRequest {
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  effectiveFromDate: string;
  changeReason: string;
}

export interface EmployeeDashboardDto {
  employeeProfile: CompleteEmployeeResponse;
  latestPayslip: LatestPayslipDto;
}

export interface LatestPayslipDto {
  paymentId: number;
  period: string;
  netSalary: number;
}

export interface AddEmployeeRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
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

export interface CompleteEmployeeRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
  bankAccount: BankAccountRequest;
  salaryStructure: SalaryStructureRequest;
}

export interface BankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface SalaryStructureRequest {
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  effectiveFromDate: string;
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

export interface UpdateEmployeeRequest {
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  bankAccount: UpdateBankAccountRequest;
}

export interface UpdateBankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateSalaryRequest {
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  effectiveFromDate: string;
  changeReason: string;
}

export interface BulkEmployeeUploadResponse {
  successfulImports: number;
  failedImports: number;
  message: string;
  successfullyImportedEmployees: string[];
  failedRecords: FailedEmployeeRecord[];
  importedEmployees: CompleteEmployeeResponse[];
  totalMonthlySalary: number;
  employeesWithBankAccounts: number;
  employeesWithSalaryStructure: number;
}

export interface FailedEmployeeRecord {
  rowNumber: number;
  rowData: Map<string, string>;
  errorMessage: string;
}

export interface MyPayslipHistoryDto {
  paymentId: number;
  payrollMonth: number;
  payrollYear: number;
  netSalaryPaid: number;
  status: string;
}

export interface PayrollPaymentResponse {
  paymentId: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  basicSalary: number;
  hra: number;
  da: number;
  otherAllowances: number;
  pfContribution: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalaryPaid: number;
  status: string;
}

export interface UpdateCompleteEmployeeRequest {
  user?: {
    fullName: string;
    email: string;
  };
  employee?: {
    department: string;
    jobTitle: string;
    isActive: boolean;
  };
  bankAccount?: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  salary?: {
    basicSalary: number;
    hra: number;
    da: number;
    pfContribution: number;
    otherAllowances: number;
    effectiveFromDate: string;
    changeReason: string;
  };
}

export interface EmployeeRequestDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  organizationId: number;
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

export interface AddEmployeeRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
}

export interface UpdateEmployeeRequest {
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  bankAccount: UpdateBankAccountRequest;
}

export interface UpdateBankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface CompleteEmployeeRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
  bankAccount: BankAccountRequest;
  salaryStructure: SalaryStructureRequest;
}

export interface BankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface SalaryStructureRequest {
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  effectiveFromDate: string;
}

export interface UpdateSalaryRequest {
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  effectiveFromDate: string;
  changeReason: string;
}

export interface EmployeeDashboardDto {
  employeeProfile: CompleteEmployeeResponse;
  latestPayslip: LatestPayslipDto;
}

export interface LatestPayslipDto {
  paymentId: number;
  period: string;
  netSalary: number;
}

export interface AddEmployeeRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
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

export interface CompleteEmployeeRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  dateOfJoining: string;
  department: string;
  jobTitle: string;
  bankAccount: BankAccountRequest;
  salaryStructure: SalaryStructureRequest;
}

export interface BankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface SalaryStructureRequest {
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  effectiveFromDate: string;
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
  deletionScheduledAt?: string | null; // ADD THIS LINE
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

export interface UpdateEmployeeRequest {
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  bankAccount: UpdateBankAccountRequest;
}

export interface UpdateBankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateSalaryRequest {
  basicSalary: number;
  hra: number;
  da: number;
  pfContribution: number;
  otherAllowances: number;
  effectiveFromDate: string;
  changeReason: string;
}

export interface BulkEmployeeUploadResponse {
  successfulImports: number;
  failedImports: number;
  message: string;
  successfullyImportedEmployees: string[];
  failedRecords: FailedEmployeeRecord[];
  importedEmployees: CompleteEmployeeResponse[];
  totalMonthlySalary: number;
  employeesWithBankAccounts: number;
  employeesWithSalaryStructure: number;
}

export interface FailedEmployeeRecord {
  rowNumber: number;
  rowData: Map<string, string>;
  errorMessage: string;
}

export interface MyPayslipHistoryDto {
  paymentId: number;
  payrollMonth: number;
  payrollYear: number;
  netSalaryPaid: number;
  status: string;
}

export interface PayrollPaymentResponse {
  paymentId: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  basicSalary: number;
  hra: number;
  da: number;
  otherAllowances: number;
  pfContribution: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalaryPaid: number;
  status: string;
}

export interface UpdateCompleteEmployeeRequest {
  user?: {
    fullName: string;
    email: string;
  };
  employee?: {
    department: string;
    jobTitle: string;
    isActive: boolean;
  };
  bankAccount?: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  salary?: {
    basicSalary: number;
    hra: number;
    da: number;
    pfContribution: number;
    otherAllowances: number;
    effectiveFromDate: string;
    changeReason: string;
  };
}
