import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { VendorBillDto, CreateBillRequest, BillPaymentRequest, CreateInstallmentPlanRequest, InstallmentDto } from "../models/vendor-bill.models";

@Injectable({
  providedIn: 'root',
})
export class VendorBillService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/api/bills/vendors';
  private installmentUrl = environment.apiUrl + '/api/bills/installments';

  // For vendors to get their own bills
  getAllBills(): Observable<VendorBillDto[]> {
    return this.http.get<VendorBillDto[]>(`${this.url}/my-bills`);
  }

  getBillById(billId: number): Observable<VendorBillDto> {
    return this.http.get<VendorBillDto>(`${this.url}/${billId}`);
  }

  // Vendor creates a new bill
  createBill(request: CreateBillRequest): Observable<VendorBillDto> {
    return this.http.post<VendorBillDto>(this.url, request);
  }

  // Org Admin pays a bill
  payBill(request: BillPaymentRequest): Observable<VendorBillDto> {
    return this.http.post<VendorBillDto>(`${this.url}/${request.billId}/pay`, request);
  }

  downloadVendorBillPdf(billId: number): Observable<Blob> {
    return this.http.get(`${this.url}/${billId}/download`, {
      responseType: 'blob'
    });
  }

  // Get bills for org admin (all vendor bills for their organization)
  getBillsForOrganization(): Observable<VendorBillDto[]> {
    return this.http.get<VendorBillDto[]>(`${this.url}/organization`);
  }

  // === INSTALLMENT METHODS ===

  // Create an installment plan for a bill
  createInstallmentPlan(request: CreateInstallmentPlanRequest): Observable<VendorBillDto> {
    return this.http.post<VendorBillDto>(`${this.installmentUrl}/plan`, request);
  }

  // Pay a specific installment
  payInstallment(installmentId: number): Observable<VendorBillDto> {
    return this.http.post<VendorBillDto>(`${this.installmentUrl}/${installmentId}/pay`, {});
  }

  // Get all installments for a bill
  getInstallmentsForBill(billId: number): Observable<InstallmentDto[]> {
    return this.http.get<InstallmentDto[]>(`${this.installmentUrl}/bill/${billId}`);
  }
}

