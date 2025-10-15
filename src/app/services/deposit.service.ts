import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  DepositRequest,
  DepositResponse
} from "../models/deposit.models";

@Injectable({
  providedIn: 'root',
})
export class DepositService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/deposits';

  makeSelfDeposit(request: DepositRequest): Observable<DepositResponse> {
    return this.http.post<DepositResponse>(`${this.url}/self`, request);
  }
}
