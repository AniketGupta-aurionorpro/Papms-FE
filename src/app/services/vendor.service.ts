import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  VendorRequest,
  VendorResponse
} from "../models/vendor.models";

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/api/vendors';

  createVendor(request: VendorRequest): Observable<VendorResponse> {
    return this.http.post<VendorResponse>(this.url, request);
  }

  getVendorById(id: number): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(`${this.url}/${id}`);
  }

  getVendorsByOrganization(organizationId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.url}/organization/${organizationId}`, { params });
  }

  updateVendor(id: number, request: VendorRequest): Observable<VendorResponse> {
    return this.http.put<VendorResponse>(`${this.url}/${id}`, request);
  }

  deleteVendor(id: number): Observable<string> {
    return this.http.delete<string>(`${this.url}/${id}`);
  }
}
