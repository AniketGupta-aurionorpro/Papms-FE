import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  ClientRequestDto,
  ClientResponseDto,
  InvoiceRequestDto,
  InvoiceResponseDto
} from "../models/client.models";

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl;

  createClient(request: ClientRequestDto): Observable<ClientResponseDto> {
    return this.http.post<ClientResponseDto>(`${this.url}/clients`, request);
  }

  getAllClients(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.url}/clients`, { params });
  }

  getClientById(clientId: number): Observable<ClientResponseDto> {
    return this.http.get<ClientResponseDto>(`${this.url}/clients/${clientId}`);
  }

  createInvoice(request: InvoiceRequestDto): Observable<InvoiceResponseDto> {
    return this.http.post<InvoiceResponseDto>(`${this.url}/invoices`, request);
  }

  getAllInvoices(): Observable<InvoiceResponseDto[]> {
    return this.http.get<InvoiceResponseDto[]>(`${this.url}/invoices`);
  }

  getInvoiceById(invoiceId: number): Observable<InvoiceResponseDto> {
    return this.http.get<InvoiceResponseDto>(`${this.url}/invoices/${invoiceId}`);
  }

  payInvoice(invoiceId: number): Observable<string> {
    return this.http.post<string>(`${this.url}/invoices/${invoiceId}/pay`, {});
  }

  downloadInvoicePdf(invoiceId: number): Observable<Blob> {
    return this.http.get(`${this.url}/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
  }
}
