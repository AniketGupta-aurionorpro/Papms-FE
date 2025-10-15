import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { VendorPaymentRequest } from "../models/vendor-payment.models";

@Injectable({
  providedIn: 'root',
})
export class VendorPaymentService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/payments/vendors';

  makePaymentToVendor(request: VendorPaymentRequest): Observable<string> {
    return this.http.post<string>(this.url, request);
  }
}
