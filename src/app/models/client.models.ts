export interface ClientRequestDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  companyName: string;
  contactPerson: string;
}

export interface ClientResponseDto {
  clientId: number;
  companyName: string;
  contactPerson: string;
  isClientActive: boolean;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  isUserActive: boolean;
  organizationId: number;
  organizationName: string;
  createdAt: string;
}

export interface InvoiceRequestDto {
  clientId: number;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
}

export interface InvoiceResponseDto {
  id: number;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paidAt: string;
  organizationId: number;
  organizationName: string;
  clientId: number;
  clientCompanyName: string;
  clientContactPerson: string;
}

export enum InvoiceStatus {
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}
