/**
 * Invoice Models
 * Models for invoice management operations
 */

export enum InvoiceStatus {
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

export interface InvoiceResponseDto {
    id: number;
    invoiceNumber: string;
    amount: number;
    paidAmount?: number;
    issueDate: string;
    dueDate: string;
    status: InvoiceStatus;
    paidAt?: string;
    organizationId: number;
    organizationName: string;
    clientId: number;
    clientCompanyName: string;
    clientContactPerson: string;
    clientEmail: string;
}

export interface InvoiceRequestDto {
    clientId: number;
    invoiceNumber: string;
    amount: number;
    issueDate: string;
    dueDate: string;
}

export interface InvoiceStats {
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
}
