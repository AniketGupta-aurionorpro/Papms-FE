import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  AddEmployeeRequest,
  EmployeeResponseDto,
  CompleteEmployeeRequest,
  CompleteEmployeeResponse,
  UpdateEmployeeRequest,
  ChangePasswordRequest,
  UpdateSalaryRequest,
  BulkEmployeeUploadResponse,
  MyPayslipHistoryDto,
  PayrollPaymentResponse
} from "../models/employee.models";

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl + '/organizations';

  addEmployee(organizationId: number, request: AddEmployeeRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/${organizationId}/employees`, request);
  }

  bulkUploadEmployees(organizationId: number, file: File): Observable<BulkEmployeeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BulkEmployeeUploadResponse>(
      `${this.baseUrl}/${organizationId}/employees/bulk-upload`,
      formData
    );
  }

  getEmployeesByOrganization(organizationId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/${organizationId}/employees`, { params });
  }

  getEmployeeById(employeeId: number): Observable<EmployeeResponseDto> {
    return this.http.get<EmployeeResponseDto>(`${this.baseUrl}/employees/${employeeId}`);
  }

  deleteEmployee(organizationId: number, employeeId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${organizationId}/employees/${employeeId}`);
  }

  addCompleteEmployee(organizationId: number, request: CompleteEmployeeRequest): Observable<CompleteEmployeeResponse> {
    return this.http.post<CompleteEmployeeResponse>(
      `${this.baseUrl}/${organizationId}/employees/complete`,
      request
    );
  }

  getCompleteEmployeesByOrganization(organizationId: number): Observable<CompleteEmployeeResponse[]> {
    return this.http.get<CompleteEmployeeResponse[]>(
      `${this.baseUrl}/${organizationId}/employees/complete`
    );
  }

  getCompleteEmployeeById(organizationId: number, employeeId: number): Observable<CompleteEmployeeResponse> {
    return this.http.get<CompleteEmployeeResponse>(
      `${this.baseUrl}/${organizationId}/employees/complete/${employeeId}`
    );
  }

  getEmployeeByUsername(username: string): Observable<EmployeeResponseDto> {
    return this.http.get<EmployeeResponseDto>(`${this.baseUrl}/employees/username/${username}`);
  }

  updateEmployeeProfile(employeeId: number, request: UpdateEmployeeRequest): Observable<CompleteEmployeeResponse> {
    return this.http.put<CompleteEmployeeResponse>(
      `${this.baseUrl}/employees/${employeeId}/profile`,
      request
    );
  }

  changePassword(employeeId: number, request: ChangePasswordRequest): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/employees/${employeeId}/password`, request);
  }

  updateBankAccount(employeeId: number, request: any): Observable<CompleteEmployeeResponse> {
    return this.http.put<CompleteEmployeeResponse>(
      `${this.baseUrl}/employees/${employeeId}/bank-account`,
      request
    );
  }

  updateEmployeeDetails(organizationId: number, employeeId: number, request: UpdateEmployeeRequest): Observable<CompleteEmployeeResponse> {
    return this.http.put<CompleteEmployeeResponse>(
      `${this.baseUrl}/${organizationId}/employees/${employeeId}/details`,
      request
    );
  }

  updateEmployeeSalary(organizationId: number, employeeId: number, request: UpdateSalaryRequest): Observable<CompleteEmployeeResponse> {
    return this.http.put<CompleteEmployeeResponse>(
      `${this.baseUrl}/${organizationId}/employees/${employeeId}/salary`,
      request
    );
  }

  toggleEmployeeStatus(organizationId: number, employeeId: number, active: boolean): Observable<CompleteEmployeeResponse> {
    const params = new HttpParams().set('active', active.toString());
    return this.http.put<CompleteEmployeeResponse>(
      `${this.baseUrl}/${organizationId}/employees/${employeeId}/status`,
      {},
      { params }
    );
  }

  bulkUploadEmployeesBatch(organizationId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(
      `${this.baseUrl}/${organizationId}/employees/bulk-upload-batch`,
      formData
    );
  }

  downloadPayslip(organizationId: number, paymentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${organizationId}/employees/payslips/${paymentId}/download`, {
      responseType: 'blob'
    });
  }

  downloadPayrollReport(organizationId: number, year: number, month: number): Observable<Blob> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get(`${this.baseUrl}/${organizationId}/employees/payrolls/report/excel`, {
      params,
      responseType: 'blob'
    });
  }

  getPayslipDetails(organizationId: number, paymentId: number): Observable<PayrollPaymentResponse> {
    return this.http.get<PayrollPaymentResponse>(
      `${this.baseUrl}/${organizationId}/employees/payslips/${paymentId}`
    );
  }

  getMyPayslipHistory(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/employees/me/payslips`, { params });
  }

  uploadProfilePicture(organizationId: number, employeeId: number, file: File): Observable<CompleteEmployeeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CompleteEmployeeResponse>(
      `${this.baseUrl}/${organizationId}/employees/${employeeId}/profile-picture`,
      formData
    );
  }

  downloadBulkUploadTemplate(organizationId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${organizationId}/employees/bulk-upload-template`, {
      responseType: 'blob'
    });
  }
}
