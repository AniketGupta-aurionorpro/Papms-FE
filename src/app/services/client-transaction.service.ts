import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Transaction Record interface
 */
export interface TransactionRecord {
    id: number;
    type: 'DEPOSIT_REQUEST' | 'INVOICE_PAYMENT';
    description: string;
    amount: number;
    status: string;
    transactionDate: string;
    balanceAfter?: number;
    referenceNumber?: string;
}

/**
 * Transaction History Response
 */
export interface TransactionHistoryResponse {
    transactions: TransactionRecord[];
    currentBalance: number;
    totalDeposited: number;
    totalSpent: number;
}

/**
 * Service for Client Transaction API operations
 */
@Injectable({
    providedIn: 'root'
})
export class ClientTransactionService {

    private baseUrl = environment.apiUrl + '/api/client-transactions';

    constructor(private http: HttpClient) { }

    /**
     * Get transaction history for logged-in client
     */
    getMyTransactions(): Observable<TransactionHistoryResponse> {
        return this.http.get<TransactionHistoryResponse>(`${this.baseUrl}/my-transactions`);
    }
}
