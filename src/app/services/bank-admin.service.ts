import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { FinancialSummaryDto } from "../models/financial-summary.models";

@Injectable({
  providedIn: 'root',
})
export class BankAdminService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/bank-admin';

  getFinancialSummary(organizationId: number): Observable<FinancialSummaryDto> {
    return this.http.get<FinancialSummaryDto>(`${this.url}/organizations/${organizationId}/financial-summary`);
  }
}
