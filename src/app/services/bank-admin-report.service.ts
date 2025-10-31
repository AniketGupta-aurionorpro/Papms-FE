import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReportRequest {
  reportType: string;
  organizationId: number | 'ALL';
  startDate: string | null;
  endDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BankAdminReportService {
  private url = environment.apiUrl + '/api/bank-admin/reports';

  constructor(private http: HttpClient) { }

  generateReport(request: ReportRequest): Observable<Blob> {
    return this.http.post(`${this.url}/generate`, request, {
      responseType: 'blob'
    });
  }
}
