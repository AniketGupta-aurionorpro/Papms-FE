import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  CreatePayrollRequest,
  PayrollBatchResponse,
  PayrollPreviewItem,
} from '../models/payroll.models';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/api';

  createPayroll(
    organizationId: number,
    request: CreatePayrollRequest
  ): Observable<PayrollBatchResponse> {
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

  getPayrollsForOrganization(
    organizationId: number,
    page: number = 0,
    size: number = 10,
    status?: string | null, // MODIFIED
    year?: number | null    // MODIFIED
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status && status !== 'ALL') {
      params = params.set('status', status);
    }
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<any>(
      `${this.url}/organizations/${organizationId}/payrolls`,
      { params }
    );
  }

  // NEW METHOD
  getPayrollsByYear(organizationId: number, year: number): Observable<PayrollBatchResponse[]> {
    return this.http.get<PayrollBatchResponse[]>(
      `${this.url}/organizations/${organizationId}/payrolls/by-year/${year}`
    );
  }

  getPayrollById(batchId: number): Observable<PayrollBatchResponse> {
    return this.http.get<PayrollBatchResponse>(
      `${this.url}/payrolls/${batchId}`
    );
  }

  approvePayroll(batchId: number): Observable<PayrollBatchResponse> {
    return this.http.put<PayrollBatchResponse>(
      `${this.url}/payrolls/${batchId}/approve`,
      {}
    );
  }

  rejectPayroll(
    batchId: number,
    reason: string
  ): Observable<PayrollBatchResponse> {
    return this.http.put<PayrollBatchResponse>(
      `${this.url}/payrolls/${batchId}/reject`,
      reason,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }

  getPendingPayrollCounts(): Observable<{ [key: number]: number }> {
    return this.http.get<{ [key: number]: number }>(
      `${this.url}/payrolls/pending-counts`
    );
  }

  getPayrollYears(organizationId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.url}/organizations/${organizationId}/payrolls/years`);
  }

  /**
   * Get payroll preview with all employee salaries for a given month/year.
   * Used in the preview step before confirming payroll creation.
   */
  getPayrollPreview(organizationId: number, month: number, year: number): Observable<PayrollPreviewItem[]> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    return this.http.get<PayrollPreviewItem[]>(
      `${this.url}/organizations/${organizationId}/payrolls/preview`,
      { params }
    );
  }
}
