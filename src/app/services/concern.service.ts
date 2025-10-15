import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  RaiseConcernRequest,
  ConcernResponseDto,
  UpdateConcernStatusRequest
} from "../models/concern.models";

@Injectable({
  providedIn: 'root',
})
export class ConcernService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl;

  raiseConcern(request: RaiseConcernRequest): Observable<ConcernResponseDto> {
    return this.http.post<ConcernResponseDto>(`${this.url}/concerns`, request);
  }

  getMyConcerns(): Observable<ConcernResponseDto[]> {
    return this.http.get<ConcernResponseDto[]>(`${this.url}/concerns/my-concerns`);
  }

  getConcernsForOrganization(organizationId: number): Observable<ConcernResponseDto[]> {
    return this.http.get<ConcernResponseDto[]>(`${this.url}/organizations/${organizationId}/concerns`);
  }

  getConcernById(concernId: number): Observable<ConcernResponseDto> {
    return this.http.get<ConcernResponseDto>(`${this.url}/concerns/${concernId}`);
  }

  updateConcernStatus(concernId: number, request: UpdateConcernStatusRequest): Observable<ConcernResponseDto> {
    return this.http.put<ConcernResponseDto>(`${this.url}/concerns/${concernId}/status`, request);
  }
}
