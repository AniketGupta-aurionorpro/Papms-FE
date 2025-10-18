import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { VendorBillDto } from "../models/vendor-bill.models";

@Injectable({
  providedIn: 'root',
})
export class VendorBillService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/api/bills/vendors';

  getAllBills(): Observable<VendorBillDto[]> {
    return this.http.get<VendorBillDto[]>(this.url);
  }

  getBillById(billId: number): Observable<VendorBillDto> {
    return this.http.get<VendorBillDto>(`${this.url}/${billId}`);
  }

  downloadVendorBillPdf(billId: number): Observable<Blob> {
    return this.http.get(`${this.url}/${billId}/download`, {
      responseType: 'blob'
    });
  }
}
