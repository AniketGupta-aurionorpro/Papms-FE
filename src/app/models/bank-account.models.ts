export interface BankAccountResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  accountHolderName: string;
  accountNumber: string; // Will be masked
  bankName: string;
  ifscCode: string;
  isPrimary: boolean;
}

export interface CreateBankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  isPrimary?: boolean;
}

export interface UpdateBankAccountRequest {
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  isPrimary?: boolean;
}
