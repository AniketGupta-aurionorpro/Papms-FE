import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  OrganizationRegistrationReq,
  OrganizationResponseDto,
  OrganizationResponseDtowithEmployee,
  OrganizationProfileResponse,
  FinancialSummaryDto
} from "../models/organization.models";

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/organizations';

  register(registrationReq: OrganizationRegistrationReq): Observable<any> {
    return this.http.post(`${this.url}/register`, registrationReq);
  }

  getAllOrganizations(): Observable<OrganizationResponseDto[]> {
    return this.http.get<OrganizationResponseDto[]>(this.url);
  }

  getOrganizationById(id: number): Observable<OrganizationResponseDto> {
    return this.http.get<OrganizationResponseDto>(`${this.url}/${id}`);
  }

  getOrganizationWithEmployees(id: number): Observable<OrganizationResponseDtowithEmployee> {
    return this.http.get<OrganizationResponseDtowithEmployee>(`${this.url}/${id}/with-employees`);
  }

  getOrganizationProfile(): Observable<OrganizationProfileResponse> {
    return this.http.get<OrganizationProfileResponse>(`${this.url}/profile`);
  }

  updateOrganizationStatus(id: number, status: string, rejectionReason?: string): Observable<any> {
    return this.http.patch(`${this.url}/${id}/status`, { status, rejectionReason });
  }

  getFinancialSummary(organizationId: number): Observable<FinancialSummaryDto> {
    return this.http.get<FinancialSummaryDto>(`${this.url}/${organizationId}/financial-summary`);
  }

  uploadLogo(logoFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return this.http.post(`${this.url}/upload-logo`, formData);
  }
}
