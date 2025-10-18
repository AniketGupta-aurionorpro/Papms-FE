import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { EmployeeDashboardDto } from "../models/employee-dashboard.models";

@Injectable({
  providedIn: 'root',
})
export class EmployeeDashboardService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/api/employees/dashboard';

  getMyDashboard(): Observable<EmployeeDashboardDto> {
    return this.http.get<EmployeeDashboardDto>(`${this.url}/me`);
  }
}
