export interface DashboardStatsDto {
  internalBalance: number;
  totalEmployees: number;
  employeeChangePercentage: number;
  totalVendors: number;
  vendorChangePercentage: number;
  pendingInvoicesCount: number;
  pendingInvoicesChangePercentage: number;
  totalAmountReceivedFromClients: number;
  totalAmountDueFromClients: number;
  totalPaidToVendors: number;
  totalTransactions: number;
  totalTransactionVolume: number;
  recentTransactions: TransactionDto[];
}

export interface TransactionDto {
  id: number;
  transactionDate: string;
  type: TransactionType;
  amount: number;
  description: string;
  balanceAfterTransaction: number;
  sourceType: TransactionSourceType;
  sourceId: number;
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum TransactionSourceType {
  DEPOSIT = 'DEPOSIT',
  PAYROLL = 'PAYROLL',
  INVOICE = 'INVOICE',
  VENDOR_PAYMENT = 'VENDOR_PAYMENT'
}

// src/app/models/dashboard.models.ts
export interface DashboardStatsDto {
  internalBalance: number;
  totalEmployees: number;
  employeeChangePercentage: number;
  totalVendors: number;
  vendorChangePercentage: number;
  pendingInvoicesCount: number;
  pendingInvoicesChangePercentage: number;
  totalAmountReceivedFromClients: number;
  totalAmountDueFromClients: number;
  totalPaidToVendors: number;
  totalTransactions: number;
  totalTransactionVolume: number;
  recentTransactions: TransactionDto[];
}

export interface BankAdminDashboardStatsDto {
  totalOrganizations: number;
  activeOrganizations: number;
  pendingOrganizations: number;
  suspendedOrganizations: number;
  organizationGrowth: OrganizationGrowthDataPoint[];
}

export interface OrganizationGrowthDataPoint {
  name: string; // "Jan 2023"
  value: number; // count
}

export interface TransactionDto {
  id: number;
  transactionDate: string;
  type: TransactionType;
  amount: number;
  description: string;
  balanceAfterTransaction: number;
  sourceType: TransactionSourceType;
  sourceId: number;
}
