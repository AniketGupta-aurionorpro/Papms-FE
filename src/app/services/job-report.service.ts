import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { JobReport, Page } from '../models/job-report.models';

@Injectable({
  providedIn: 'root'
})
export class JobReportService {
  private baseUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) { }

  getReportsForOrganization(organizationId: number, page: number = 0, size: number = 10): Observable<Page<JobReport>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<JobReport>>(`${this.baseUrl}/organizations/${organizationId}/job-reports`, { params });
  }

  getReportById(reportId: number): Observable<JobReport> {
    return this.http.get<JobReport>(`${this.baseUrl}/job-reports/${reportId}`);
  }
}
