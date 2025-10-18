import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  BankAccountResponse,
  CreateBankAccountRequest,
  UpdateBankAccountRequest
} from "../models/bank-account.models";

@Injectable({
  providedIn: 'root',
})
export class BankAccountService {
  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl + '/api/organizations';

  /**
   * Get all bank accounts for organization
   * ORG_ADMIN: view all accounts, EMPLOYEE: view own accounts only
   */
  getBankAccounts(organizationId: number): Observable<BankAccountResponse[]> {
    return this.http.get<BankAccountResponse[]>(
      `${this.baseUrl}/${organizationId}/bank-accounts`
    );
  }

  /**
   * Get specific bank account details
   */
  getBankAccountById(organizationId: number, accountId: number): Observable<BankAccountResponse> {
    return this.http.get<BankAccountResponse>(
      `${this.baseUrl}/${organizationId}/bank-accounts/${accountId}`
    );
  }

  /**
   * Get bank accounts for specific employee
   * ORG_ADMIN: view any employee, EMPLOYEE: view own accounts only
   */
  getEmployeeBankAccounts(organizationId: number, employeeId: number): Observable<BankAccountResponse[]> {
    return this.http.get<BankAccountResponse[]>(
      `${this.baseUrl}/${organizationId}/bank-accounts/employees/${employeeId}`
    );
  }

  /**
   * Create bank account for employee (ORG_ADMIN only)
   */
  createEmployeeBankAccount(
    organizationId: number,
    employeeId: number,
    request: CreateBankAccountRequest
  ): Observable<BankAccountResponse> {
    return this.http.post<BankAccountResponse>(
      `${this.baseUrl}/${organizationId}/bank-accounts/employees/${employeeId}`,
      request
    );
  }

  /**
   * Update bank account details
   */
  updateBankAccount(
    organizationId: number,
    accountId: number,
    request: UpdateBankAccountRequest
  ): Observable<BankAccountResponse> {
    return this.http.put<BankAccountResponse>(
      `${this.baseUrl}/${organizationId}/bank-accounts/${accountId}`,
      request
    );
  }

  /**
   * Set account as primary
   */
  setPrimaryAccount(organizationId: number, accountId: number): Observable<BankAccountResponse> {
    return this.http.patch<BankAccountResponse>(
      `${this.baseUrl}/${organizationId}/bank-accounts/${accountId}/primary`,
      {}
    );
  }

  /**
   * Delete bank account
   */
  deleteBankAccount(organizationId: number, accountId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${organizationId}/bank-accounts/${accountId}`
    );
  }

  /**
   * Validate IFSC code
   */
  validateIfscCode(ifscCode: string): Observable<{ valid: boolean; bankName?: string }> {
    const params = new HttpParams().set('ifsc', ifscCode);
    return this.http.get<{ valid: boolean; bankName?: string }>(
      `${environment.apiUrl}/bank/validate-ifsc`,
      { params }
    );
  }

  /**
   * Mask account number for display
   */
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 8) {
      return accountNumber;
    }
    const visibleDigits = 4;
    const maskedLength = accountNumber.length - visibleDigits;
    const maskedPart = '*'.repeat(maskedLength);
    const visiblePart = accountNumber.substring(accountNumber.length - visibleDigits);
    return maskedPart + visiblePart;
  }

  /**
   * Format bank account for display
   */
  formatBankDisplay(account: BankAccountResponse): string {
    const maskedAccount = this.maskAccountNumber(account.accountNumber);
    return `${account.bankName} - ${maskedAccount} (${account.ifscCode})`;
  }
}
