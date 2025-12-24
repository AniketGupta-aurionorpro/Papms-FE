import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Client Deposit Request DTOs
 */
export enum ClientDepositStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface ClientDepositCreateRequest {
    amount: number;
    referenceNumber?: string;
    remarks?: string;
}

export interface ClientDepositResponse {
    id: number;
    clientId: number;
    clientName: string;
    clientEmail: string;
    organizationId: number;
    organizationName: string;
    amount: number;
    referenceNumber?: string;
    remarks?: string;
    status: ClientDepositStatus;
    rejectionReason?: string;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClientDepositRejectRequest {
    rejectionReason?: string;
}

/**
 * Service for Client Deposit Request API operations
 */
@Injectable({
    providedIn: 'root'
})
export class ClientDepositService {

    private baseUrl = environment.apiUrl + '/api/client-deposits';

    constructor(private http: HttpClient) { }

    /**
     * Create a new deposit request (CLIENT)
     */
    createDepositRequest(request: ClientDepositCreateRequest): Observable<ClientDepositResponse> {
        return this.http.post<ClientDepositResponse>(this.baseUrl, request);
    }

    /**
     * Get my deposit requests (CLIENT)
     */
    getMyDepositRequests(): Observable<ClientDepositResponse[]> {
        return this.http.get<ClientDepositResponse[]>(`${this.baseUrl}/my-requests`);
    }

    /**
     * Get all deposit requests for organization (ORG_ADMIN)
     */
    getOrganizationDepositRequests(): Observable<ClientDepositResponse[]> {
        return this.http.get<ClientDepositResponse[]>(`${this.baseUrl}/organization`);
    }

    /**
     * Get pending deposit requests (ORG_ADMIN)
     */
    getPendingDepositRequests(): Observable<ClientDepositResponse[]> {
        return this.http.get<ClientDepositResponse[]>(`${this.baseUrl}/organization/pending`);
    }

    /**
     * Get pending count (ORG_ADMIN)
     */
    getPendingCount(): Observable<{ pendingCount: number }> {
        return this.http.get<{ pendingCount: number }>(`${this.baseUrl}/organization/pending-count`);
    }

    /**
     * Approve a deposit request (ORG_ADMIN)
     */
    approveDeposit(depositId: number): Observable<ClientDepositResponse> {
        return this.http.post<ClientDepositResponse>(`${this.baseUrl}/${depositId}/approve`, {});
    }

    /**
     * Reject a deposit request (ORG_ADMIN)
     */
    rejectDeposit(depositId: number, request: ClientDepositRejectRequest): Observable<ClientDepositResponse> {
        return this.http.post<ClientDepositResponse>(`${this.baseUrl}/${depositId}/reject`, request);
    }

    /**
     * Get deposit request by ID
     */
    getDepositById(depositId: number): Observable<ClientDepositResponse> {
        return this.http.get<ClientDepositResponse>(`${this.baseUrl}/${depositId}`);
    }
}
