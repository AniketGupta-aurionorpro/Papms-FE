import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { FinancialSummaryDto } from "../models/financial-summary.models";
import { BankAdminDashboardStatsDto } from "../models/dashboard.models";

@Injectable({
  providedIn: 'root',
})
export class BankAdminService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/api/bank-admin';

  getFinancialSummary(organizationId: number): Observable<FinancialSummaryDto> {
    return this.http.get<FinancialSummaryDto>(`${this.url}/organizations/${organizationId}/financial-summary`);
  }

  getDashboardStats(): Observable<BankAdminDashboardStatsDto> {
    return this.http.get<BankAdminDashboardStatsDto>(`${this.url}/dashboard-stats`);
  }
}
