import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClientDto, OnboardClientRequest } from '../models/client-portal.models';

/**
 * Service for Client Portal API operations
 * Handles client onboarding and management
 */
@Injectable({
    providedIn: 'root'
})
export class ClientPortalService {

    private baseUrl = environment.apiUrl + '/api/clients/portal';

    constructor(private http: HttpClient) { }

    /**
     * Onboard a new client (ORG_ADMIN only)
     * Auto-generates credentials and sends welcome email
     */
    onboardClient(request: OnboardClientRequest): Observable<ClientDto> {
        return this.http.post<ClientDto>(`${this.baseUrl}/onboard`, request);
    }

    /**
     * Get all clients for the organization (ORG_ADMIN only) with pagination
     */
    getAllClients(page: number = 0, size: number = 10): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}`);
    }

    /**
     * Get client by ID (ORG_ADMIN only)
     */
    getClientById(clientId: number): Observable<ClientDto> {
        return this.http.get<ClientDto>(`${this.baseUrl}/${clientId}`);
    }

    /**
     * Get current client's profile (CLIENT role only)
     */
    getMyProfile(): Observable<ClientDto> {
        return this.http.get<ClientDto>(`${this.baseUrl}/me`);
    }

    /**
     * Suspend a client account (ORG_ADMIN only)
     */
    suspendClient(clientId: number): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${clientId}/suspend`, {});
    }

    /**
     * Activate a suspended client account (ORG_ADMIN only)
     */
    activateClient(clientId: number): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${clientId}/activate`, {});
    }
}
