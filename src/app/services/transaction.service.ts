import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { TransactionDto } from "../models/transaction.models";

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl + '/api/organizations';

  // --- MODIFIED SIGNATURE AND LOGIC ---
  getTransactions(
    organizationId: number,
    page: number = 0,
    size: number = 10,
    searchTerm?: string | null,
    startDate?: string | null,
    endDate?: string | null,
    type?: string | null
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

    return this.http.get<any>(`${this.baseUrl}/${organizationId}/transactions`, { params });
  }
  // --- END MODIFICATION ---

  downloadTransactionReport(organizationId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${organizationId}/transactions/download/excel`, {
      responseType: 'blob'
    });
  }
}
