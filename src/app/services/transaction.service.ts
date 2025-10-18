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

  getTransactions(organizationId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/${organizationId}/transactions`, { params });
  }

  downloadTransactionReport(organizationId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${organizationId}/transactions/download/excel`, {
      responseType: 'blob'
    });
  }
}
