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
