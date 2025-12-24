import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  OrganizationRegistrationReq,
  OrganizationResponseDto,
  OrganizationResponseDtowithEmployee,
  OrganizationProfileResponse,
  FinancialSummaryDto,
} from '../models/organization.models';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: HttpClient) { }

  // private url = environment.apiUrl + '/organizations';
  private url = environment.apiUrl + '/api/organizations';

  // register(registrationReq: OrganizationRegistrationReq): Observable<any> {
  //   return this.http.post(`${this.url}/register`, registrationReq);
  // }

  register(formData: FormData): Observable<OrganizationResponseDto> {
    return this.http.post<OrganizationResponseDto>(
      `${this.url}/register`,
      formData
    );
  }

  // getAllOrganizations(): Observable<OrganizationResponseDto[]> {
  //   return this.http.get<OrganizationResponseDto[]>(this.url);
  // }

  getAllOrganizations(
    page: number = 0,
    size: number = 10,
    status?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<any>(this.url, { params });
  }

  getOrganizationById(id: number): Observable<OrganizationResponseDto> {
    return this.http.get<OrganizationResponseDto>(`${this.url}/${id}`);
  }

  getOrganizationWithEmployees(
    id: number
  ): Observable<OrganizationResponseDtowithEmployee> {
    return this.http.get<OrganizationResponseDtowithEmployee>(
      `${this.url}/${id}/with-employees`
    );
  }

  getOrganizationProfile(organizationId: number): Observable<OrganizationProfileResponse> {
    return this.http.get<OrganizationProfileResponse>(`${this.url}/${organizationId}/profile`);
  }

  updateOrganizationStatus(
    id: number,
    status: string,
    rejectionReason?: string
  ): Observable<any> {
    return this.http.patch(`${this.url}/${id}/status`, {
      status,
      rejectionReason,
    });
  }

  getFinancialSummary(organizationId: number): Observable<FinancialSummaryDto> {
    return this.http.get<FinancialSummaryDto>(
      `${this.url}/${organizationId}/financial-summary`
    );
  }
  reactivateOrganization(id: number): Observable<any> {
    return this.http.put(`${this.url}/${id}/reactivate`, {});
  }
  uploadLogo(logoFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return this.http.post(`${this.url}/upload-logo`, formData);
  }

  approveOrganization(id: number): Observable<OrganizationResponseDto> {
    return this.http.put<OrganizationResponseDto>(`${this.url}/${id}/approve`, {});
  }

  suspendOrganization(id: number): Observable<any> {
    return this.http.put(`${this.url}/${id}/suspend`, {});
  }

  // --- NEW: Specific method for rejecting an organization with a reason ---
  rejectOrganization(id: number, reason: string): Observable<any> {
    return this.http.put(`${this.url}/${id}/reject`, reason, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }


}
