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
