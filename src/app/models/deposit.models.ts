export interface DepositRequest {
  amount: number;
}

export interface DepositResponse {
  id: number;
  organizationId: number;
  organizationName: string;
  amountDeposited: number;
  balanceAfterDeposit: number;
  depositTimestamp: string;
}
