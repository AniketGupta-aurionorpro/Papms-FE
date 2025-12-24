// Vendor Bill Models

export enum BillStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  PAY_LATER = 'PAY_LATER',
  INSTALLMENTS = 'INSTALLMENTS',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMode {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  INSTALLMENTS = 'INSTALLMENTS',
  PAY_LATER = 'PAY_LATER'
}

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface InstallmentDto {
  id: number;
  billId: number;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: InstallmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VendorBillDto {
  id: number;
  billNumber: string;
  vendorId: number;
  vendorName: string;
  organizationId: number;
  organizationName: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  billDate: string;
  dueDate: string;
  status: BillStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Installment fields
  installments?: InstallmentDto[];
  totalInstallments?: number;
  paidInstallments?: number;
  installmentFrequency?: string;
}

export interface CreateBillRequest {
  vendorId?: number; // Optional for vendor-created bills (auto-filled from token)
  organizationId?: number;
  amount: number;
  description: string;
  dueDate: string;
  items?: BillItem[];
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface BillPaymentRequest {
  billId: number;
  amount: number;
  paymentMode: PaymentMode;
  description?: string;
}

export interface CreateInstallmentPlanRequest {
  billId: number;
  numberOfInstallments: number;
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  firstInstallmentDate: string;
}

