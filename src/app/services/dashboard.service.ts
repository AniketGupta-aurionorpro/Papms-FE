import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStatsDto } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private url = environment.apiUrl + '/api/organizations';

  constructor(private http: HttpClient) { }

  getDashboardStatsForOrganization(organizationId: number): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${this.url}/${organizationId}/dashboard`);
  }
}
