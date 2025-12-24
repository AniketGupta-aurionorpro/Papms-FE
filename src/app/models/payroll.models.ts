export interface CreatePayrollRequest {
  payrollMonth: number;
  payrollYear: number;
  salaryOverrides?: SalaryOverride[];
}

export interface SalaryOverride {
  employeeId: number;
  basicSalary: number;
  hra: number;
  da: number;
  otherAllowances: number;
  pfContribution: number;
}

export interface PayrollPreviewItem {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  department: string;
  basicSalary: number;
  hra: number;
  da: number;
  otherAllowances: number;
  pfContribution: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  // UI-only fields
  isModified?: boolean;
}

export interface PayrollBatchResponse {
  id: number;
  organizationId: number;
  organizationName: string;
  payrollMonth: number;
  payrollYear: number;
  totalAmount: number;
  totalEmployees: number;
  status: PayrollStatus;
  submittedBy: string;
  approvedBy: string;
  rejectionReason: string;
  createdAt: string;
  payments: PayrollPaymentResponse[];
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
  status: PaymentStatus;
  salaryModified?: boolean;
}

export enum PayrollStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  COMPLETED = 'COMPLETED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

