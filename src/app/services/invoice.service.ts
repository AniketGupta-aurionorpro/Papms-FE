import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InvoiceRequestDto, InvoiceResponseDto } from '../models/invoice.models';

/**
 * Invoice Payment DTOs
 */
export interface InvoicePaymentRequest {
    invoiceId?: number;
    paymentMode: 'FULL' | 'PARTIAL';
    amount?: number;
    description?: string;
}

export interface InvoicePaymentResponse {
    invoiceId: number;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    clientBalanceAfter: number;
    message: string;
}

/**
 * Service for Invoice API operations
 * Handles invoice CRUD, PDF generation, and email sending
 */
@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    private baseUrl = environment.apiUrl + '/api/invoices';

    constructor(private http: HttpClient) { }

    /**
     * Create a new invoice
     */
    createInvoice(request: InvoiceRequestDto): Observable<InvoiceResponseDto> {
        return this.http.post<InvoiceResponseDto>(this.baseUrl, request);
    }

    /**
     * Create invoice and send email immediately
     */
    createAndSendInvoice(request: InvoiceRequestDto): Observable<InvoiceResponseDto> {
        return this.http.post<InvoiceResponseDto>(`${this.baseUrl}/create-and-send`, request);
    }

    /**
     * Get all invoices for the organization
     */
    getInvoices(): Observable<InvoiceResponseDto[]> {
        return this.http.get<InvoiceResponseDto[]>(this.baseUrl);
    }

    /**
     * Get invoice by ID
     */
    getInvoiceById(id: number): Observable<InvoiceResponseDto> {
        return this.http.get<InvoiceResponseDto>(`${this.baseUrl}/${id}`);
    }

    /**
     * Get invoices for a specific client
     */
    getClientInvoices(clientId: number): Observable<InvoiceResponseDto[]> {
        return this.http.get<InvoiceResponseDto[]>(`${this.baseUrl}/client/${clientId}`);
    }

    /**
     * Download invoice PDF
     */
    downloadPdf(invoiceId: number): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/${invoiceId}/pdf`, {
            responseType: 'blob'
        });
    }

    /**
     * Send invoice email to client
     */
    sendInvoiceEmail(invoiceId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/${invoiceId}/send-email`, {});
    }

    /**
     * Mark invoice as paid
     */
    markAsPaid(invoiceId: number): Observable<InvoiceResponseDto> {
        return this.http.put<InvoiceResponseDto>(`${this.baseUrl}/${invoiceId}/mark-paid`, {});
    }

    /**
     * Cancel an invoice
     */
    cancelInvoice(invoiceId: number): Observable<InvoiceResponseDto> {
        return this.http.put<InvoiceResponseDto>(`${this.baseUrl}/${invoiceId}/cancel`, {});
    }

    /**
     * Pay an invoice (FULL or PARTIAL) from client wallet balance
     */
    payInvoice(invoiceId: number, request: InvoicePaymentRequest): Observable<InvoicePaymentResponse> {
        return this.http.post<InvoicePaymentResponse>(`${this.baseUrl}/${invoiceId}/pay`, request);
    }
}
