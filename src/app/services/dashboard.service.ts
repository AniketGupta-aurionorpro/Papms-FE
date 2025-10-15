import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { OutletDataResponse, VoucherStatsResponse } from "../models/VoucherResponse.interface";
import { OutletResponse } from "../models/Outlet.interface";
import { DashboardStatsDto } from "../models/dashboard.models";

@Injectable({
    providedIn: 'root',
})

export class DashboardService {

    constructor(private http: HttpClient) { }
    url = environment.apiUrl;

  private baseUrl = environment.apiUrl + '/organizations';

  getDashboardStats(organizationId: number): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${this.baseUrl}/${organizationId}/dashboard`);
  }

    getSuccessfulRedeemsPerOutlet(): Observable<OutletDataResponse> {
        return this.http.get<OutletDataResponse>(`${this.url}/vouchercodes/getSuccessfulRedeemsPerOutlet`);
    }

    getAllVouchersData(): Observable<VoucherStatsResponse> {
        return this.http.get<VoucherStatsResponse>(`${this.url}/vouchercodes/getAllVouchersData`);
    }

    getAllOutlets(): Observable<OutletResponse> {
        return this.http.get<OutletResponse>(`${this.url}/vouchercodes/getAllOutlets`);
    }
}


