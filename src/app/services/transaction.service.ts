import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { TransactionDto, TransactionSourceType, TransactionType } from "../models/transaction.models"; // MODIFIED

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl + '/api/organizations';

  getTransactions(
    organizationId: number,
    page: number = 0,
    size: number = 10,
    searchTerm?: string | null,
    startDate?: string | null,
    endDate?: string | null,
    type?: TransactionType | 'ALL' | null, // MODIFIED
    sourceType?: TransactionSourceType | null // NEW PARAMETER
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (type && type !== 'ALL') {
      params = params.set('type', type);
    }
    // --- FIX IS HERE ---
    if (sourceType) {
      params = params.set('sourceType', sourceType);
    }
    // --- END FIX ---

    return this.http.get<any>(`${this.baseUrl}/${organizationId}/transactions`, { params });
  }

  downloadTransactionReport(organizationId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${organizationId}/transactions/download/excel`, {
      responseType: 'blob'
    });
  }
}
