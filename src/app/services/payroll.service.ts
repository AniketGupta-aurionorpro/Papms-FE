import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  CreatePayrollRequest,
  PayrollBatchResponse
} from "../models/payroll.models";

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  constructor(private http: HttpClient) { }

 private url = environment.apiUrl + '/api';

  createPayroll(organizationId: number, request: CreatePayrollRequest): Observable<PayrollBatchResponse> {
    return this.http.post<PayrollBatchResponse>(
      `${this.url}/organizations/${organizationId}/payrolls`,
      request
    );
  }

  getPendingPayrolls(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.url}/payrolls/pending`, { params });
  }

  getPayrollsForOrganization(organizationId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.url}/organizations/${organizationId}/payrolls`, { params });
  }

  getPayrollById(batchId: number): Observable<PayrollBatchResponse> {
    return this.http.get<PayrollBatchResponse>(`${this.url}/payrolls/${batchId}`);
  }

  approvePayroll(batchId: number): Observable<PayrollBatchResponse> {
    return this.http.put<PayrollBatchResponse>(`${this.url}/payrolls/${batchId}/approve`, {});
  }

  rejectPayroll(batchId: number, reason: string): Observable<PayrollBatchResponse> {
    return this.http.put<PayrollBatchResponse>(
      `${this.url}/payrolls/${batchId}/reject`,
      reason,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }
}
